import { gsap, ScrollTrigger } from '../../vendor.js'

// Configuration constants
const CONFIG = {
  CYCLE_DURATION: 6,
  ANIMATION_DURATION: 0.8,
  ANIMATION_EASE: 'power3.inOut',
  STAGGER_DELAY: 0.025,
  NAVIGATION_DELAY: 100,
  SCROLL_LINES: {
    DURATION: 2,
    EASE: 'expo.out',
    STAGGER: 0.15,
  },
}

// Global state
let ctx
let logoTimelines = new Map()

// Utility functions
const isVisible = el => window.getComputedStyle(el).display !== 'none'

const shuffleArray = arr => {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getLogoId = logoElement => {
  if (logoElement.dataset.logoId) return logoElement.dataset.logoId

  const img = logoElement.querySelector('img')
  if (img?.src) {
    return img.src.split('/').pop().split('.')[0]
  }

  const svg = logoElement.querySelector('svg')
  if (svg) {
    const viewBox = svg.getAttribute('viewBox') || 'no-viewbox'
    const className = svg.className || logoElement.className || 'no-class'
    const width = svg.getAttribute('width') || 'no-width'
    return `svg_${className}_${viewBox}_${width}`.replace(/\s+/g, '_')
  }

  // Fallback to content hash
  const content = logoElement.innerHTML.replace(/\s+/g, '')
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `logo_hash_${Math.abs(hash)}`
}

function init() {
  ctx = gsap.context(() => {
    initScrollLines()
    initLogoCycle()
  })
}

function initScrollLines() {
  const sections = document.querySelectorAll('[data-anm-scroll-line=section]')

  sections.forEach(section => {
    const lines = {
      top: section.querySelectorAll('.g_scroll_line.is-top'),
      bottom: section.querySelectorAll('.g_scroll_line.is-bottom'),
      left: section.querySelectorAll('.g_scroll_line.is-left'),
      right: section.querySelectorAll('.g_scroll_line.is-right'),
      all: section.querySelectorAll('.g_scroll_line'),
    }

    const tl = gsap.timeline({
      defaults: {
        duration: CONFIG.SCROLL_LINES.DURATION,
        ease: CONFIG.SCROLL_LINES.EASE,
      },
    })

    // Set initial states
    gsap.set([lines.top, lines.bottom], { scaleX: 0 })
    gsap.set([lines.left, lines.right], { scaleY: 0 })

    // Animate with proper transform origins
    tl.to(lines.all, {
      scaleX: (_, target) => {
        return target.classList.contains('is-top') || target.classList.contains('is-bottom') ? 1 : undefined
      },
      scaleY: (_, target) => {
        return target.classList.contains('is-left') || target.classList.contains('is-right') ? 1 : undefined
      },
      transformOrigin: (_, target) => {
        if (target.classList.contains('is-top')) return 'right center'
        if (target.classList.contains('is-bottom')) return 'left center'
        if (target.classList.contains('is-left')) return 'bottom center'
        if (target.classList.contains('is-right')) return 'top center'
        return 'center center'
      },
      stagger: {
        each: CONFIG.SCROLL_LINES.STAGGER,
        from: [2, 0],
        grid: [3, 4],
        axis: 'y',
      },
    })

    ScrollTrigger.create({
      animation: tl,
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none none',
    })
  })
}

// Logo Grid Manager Class
class LogoGridManager {
  constructor(root) {
    this.root = root
    this.elements = this.cacheElements()
    this.config = this.getConfig()
    this.state = this.initializeState()

    this.setup()
  }

  cacheElements() {
    const list = this.root.querySelector('[data-anm-logo-grid="list"]')
    return {
      list,
      items: Array.from(list?.querySelectorAll('[data-anm-logo-grid="item"]') || []),
      progressBar: this.root.querySelector('[data-anm-logo-grid="progress-bar"]'),
      leftArrow: this.root.querySelector('[data-anm-logo-grid="arrow-left"]'),
      rightArrow: this.root.querySelector('[data-anm-logo-grid="arrow-right"]'),
      originalLogos: Array.from(this.root.querySelectorAll('[data-anm-logo-grid="logo"]')).filter(Boolean),
    }
  }

  getConfig() {
    return {
      shuffleFront: this.root.getAttribute('data-anm-logo-grid-shuffle') !== 'false',
      cycleDuration: CONFIG.CYCLE_DURATION,
      animDuration: CONFIG.ANIMATION_DURATION,
      animEase: CONFIG.ANIMATION_EASE,
    }
  }

  initializeState() {
    return {
      visibleItems: [],
      visibleCount: 0,
      cycleHistory: [],
      currentCycleIndex: -1,
      isNavigating: false,
      logoUsageTracker: new Map(),
      lastCyclePositions: new Map(),
      mainTimeline: null,
      progressTimeline: null,
    }
  }

  setup() {
    this.cleanup()
    this.updateVisibleItems()
    this.initializeLogoPool()
    this.initializeLogoTracking()
    this.createInitialCycle()
    this.setupTimelines()
    this.setupNavigation()
    this.setupScrollTrigger()
  }

  cleanup() {
    if (this.state.mainTimeline) {
      this.state.mainTimeline.kill()
    }
    if (this.state.progressTimeline) {
      this.state.progressTimeline.kill()
    }

    // Clear existing logos from grid items
    this.elements.items.forEach(item => {
      const target = item.querySelector('[data-anm-logo-grid="target"]')
      if (target) {
        Array.from(target.children).forEach(child => child.remove())
      }
    })
  }

  updateVisibleItems() {
    this.state.visibleItems = this.elements.items.filter(isVisible)
    this.state.visibleCount = this.state.visibleItems.length
  }

  initializeLogoPool() {
    const pool = this.elements.originalLogos.map(logo => logo.cloneNode(true))

    if (this.config.shuffleFront) {
      const shuffled = shuffleArray(pool)
      const front = shuffled.slice(0, this.state.visibleCount)
      const rest = shuffleArray(shuffled.slice(this.state.visibleCount))
      this.logoPool = front.concat(rest)
    } else {
      const front = pool.slice(0, this.state.visibleCount)
      const rest = shuffleArray(pool.slice(this.state.visibleCount))
      this.logoPool = front.concat(rest)
    }
  }

  initializeLogoTracking() {
    this.elements.originalLogos.forEach(logo => {
      const logoId = getLogoId(logo)
      this.state.logoUsageTracker.set(logoId, 0)
    })
  }

  createInitialCycle() {
    const initialCycle = this.generateNewCycle()
    this.state.cycleHistory = [initialCycle]
    this.state.currentCycleIndex = 0
    this.placeLogos(initialCycle)
  }

  placeLogos(cycle) {
    cycle.forEach((logo, index) => {
      if (index >= this.state.visibleCount) return

      const item = this.state.visibleItems[index]
      const parent = item.querySelector('[data-anm-logo-grid="target-parent"]') || item
      const target = parent.querySelector('[data-anm-logo-grid="target"]')
      const before = parent.querySelector('[data-anm-logo-grid="before"]')

      if (before && target && logo) {
        const logoClone = logo.cloneNode(true)
        target.appendChild(logoClone)

        const logoId = getLogoId(logo)
        this.state.lastCyclePositions.set(index, logoId)
      }
    })
  }

  generateNewCycle() {
    const newCycle = []
    const availableLogos = this.elements.originalLogos.map(logo => ({
      element: logo.cloneNode(true),
      id: getLogoId(logo),
      usage: this.state.logoUsageTracker.get(getLogoId(logo)) || 0,
    }))

    // For each position, find the best logo candidate
    for (let position = 0; position < this.state.visibleCount; position++) {
      const lastLogoAtPosition = this.state.lastCyclePositions.get(position)

      // Filter out logos that were in this position last cycle and already selected
      let candidates = availableLogos.filter(
        logo => logo.id !== lastLogoAtPosition && !newCycle.some(selected => selected.id === logo.id)
      )

      // Fallback if no candidates
      if (candidates.length === 0) {
        candidates = availableLogos.filter(logo => !newCycle.some(selected => selected.id === logo.id))
      }

      if (candidates.length === 0) {
        // Final fallback
        const fallbackLogo = this.elements.originalLogos[position % this.elements.originalLogos.length].cloneNode(true)
        const fallbackId = getLogoId(fallbackLogo)
        newCycle.push({
          element: fallbackLogo,
          id: fallbackId,
          usage: 0,
        })
        continue
      }

      // Sort by usage (lowest first), then randomize
      candidates.sort((a, b) => {
        const usageDiff = a.usage - b.usage
        return usageDiff !== 0 ? usageDiff : Math.random() - 0.5
      })

      const selectedLogo = candidates[0]
      newCycle.push(selectedLogo)

      // Update tracking
      this.state.logoUsageTracker.set(selectedLogo.id, selectedLogo.usage + 1)
      this.state.lastCyclePositions.set(position, selectedLogo.id)
    }

    return newCycle.map(item => item.element)
  }

  setupTimelines() {
    // Initialize progress bar
    if (this.elements.progressBar) {
      gsap.set(this.elements.progressBar, { width: '0%' })
    }

    // Create main cycling timeline
    this.state.mainTimeline = gsap.timeline({
      repeat: -1,
      repeatDelay: this.config.cycleDuration,
      onRepeat: () => {
        if (this.state.progressTimeline) {
          this.state.progressTimeline.restart()
        }
        if (!this.state.isNavigating) {
          this.cycleAllLogos()
        }
      },
    })

    this.state.mainTimeline.call(() => this.cycleAllLogos())
    this.state.mainTimeline.play()

    // Setup progress bar animation
    this.setupProgressBar()
  }

  setupProgressBar() {
    if (!this.elements.progressBar) return

    this.state.progressTimeline = gsap.timeline({ repeat: -1 })
    this.state.progressTimeline.fromTo(
      this.elements.progressBar,
      { width: '0%' },
      {
        width: '100%',
        duration: this.config.cycleDuration,
        ease: 'none',
      }
    )
    this.state.progressTimeline.to({}, { duration: this.config.cycleDuration })
    this.state.progressTimeline.play()
  }

  applyCycle(cycle) {
    if (!cycle?.length) return

    const cycleTl = gsap.timeline()

    this.state.visibleItems.forEach((item, index) => {
      const parent = item.querySelector('[data-anm-logo-grid="target-parent"]') || item
      const targetContainer = parent.querySelector('[data-anm-logo-grid="target"]')
      const before = parent.querySelector('[data-anm-logo-grid="before"]')

      if (!targetContainer || !before || !cycle[index]) return

      const current = targetContainer.children[0]
      const incoming = cycle[index].cloneNode(true)
      const staggerDelay = index * CONFIG.STAGGER_DELAY

      // Set initial state for incoming logo
      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 })
      targetContainer.appendChild(incoming)

      // Animate out current logo
      if (current) {
        cycleTl.to(
          current,
          {
            yPercent: -50,
            autoAlpha: 0,
            filter: 'blur(5px)',
            duration: this.config.animDuration,
            ease: this.config.animEase,
            onComplete: () => current.remove(),
          },
          staggerDelay
        )
      }

      // Animate in new logo
      cycleTl.to(
        incoming,
        {
          yPercent: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: this.config.animDuration,
          delay: 0.2,
          ease: this.config.animEase,
        },
        staggerDelay
      )
    })
  }

  cycleAllLogos() {
    if (this.state.isNavigating) return

    this.cleanupCurrentAnimations(() => {
      const newCycle = this.generateNewCycle()

      // Truncate history if not at the end
      if (this.state.currentCycleIndex < this.state.cycleHistory.length - 1) {
        this.state.cycleHistory = this.state.cycleHistory.slice(0, this.state.currentCycleIndex + 1)
      }

      // Add new cycle to history
      this.state.cycleHistory.push(newCycle)
      this.state.currentCycleIndex = this.state.cycleHistory.length - 1

      // Apply the new cycle
      this.applyCycle(newCycle)

      // Update button states
      this.updateButtonStates()
    })
  }

  cleanupCurrentAnimations(callback) {
    // Simple DOM cleanup without RAF wrapper
    this.state.visibleItems.forEach(item => {
      const parent = item.querySelector('[data-anm-logo-grid="target-parent"]') || item
      const targetContainer = parent.querySelector('[data-anm-logo-grid="target"]')

      if (targetContainer && targetContainer.children.length > 1) {
        const children = Array.from(targetContainer.children)
        children.slice(1).forEach(child => {
          gsap.set(child, { autoAlpha: 0 })
          child.remove()
        })
      }
    })

    if (callback) {
      callback()
    }
  }

  updateButtonStates() {
    if (!this.elements.leftArrow || !this.elements.rightArrow) return

    // Disable prev button if at first cycle
    const isAtStart = this.state.currentCycleIndex <= 0

    this.elements.leftArrow.disabled = isAtStart
    this.elements.leftArrow.style.opacity = isAtStart ? '0.5' : '1'
    this.elements.leftArrow.style.cursor = isAtStart ? 'not-allowed' : 'pointer'

    // Next button is always enabled
    this.elements.rightArrow.disabled = false
    this.elements.rightArrow.style.opacity = '1'
    this.elements.rightArrow.style.cursor = 'pointer'
  }

  setupNavigation() {
    if (!this.elements.leftArrow || !this.elements.rightArrow) return

    const navigateNext = () => {
      if (this.state.isNavigating) return
      this.state.isNavigating = true

      this.cleanupCurrentAnimations(() => {
        const newCycle = this.generateNewCycle()

        // Truncate history if not at the end
        if (this.state.currentCycleIndex < this.state.cycleHistory.length - 1) {
          this.state.cycleHistory = this.state.cycleHistory.slice(0, this.state.currentCycleIndex + 1)
        }

        // Add new cycle
        this.state.cycleHistory.push(newCycle)
        this.state.currentCycleIndex = this.state.cycleHistory.length - 1

        // Apply cycle and update states
        this.applyCycle(newCycle)
        this.updateButtonStates()

        // Reset timelines
        if (this.state.progressTimeline) {
          this.state.progressTimeline.restart()
        }
        if (this.state.mainTimeline) {
          this.state.mainTimeline.restart()
        }

        setTimeout(() => {
          this.state.isNavigating = false
        }, CONFIG.NAVIGATION_DELAY)
      })
    }

    const navigatePrev = () => {
      if (this.state.currentCycleIndex <= 0 || this.state.isNavigating) return
      this.state.isNavigating = true

      this.cleanupCurrentAnimations(() => {
        this.state.currentCycleIndex--
        const targetCycle = this.state.cycleHistory[this.state.currentCycleIndex]

        if (targetCycle) {
          this.applyCycle(targetCycle)
        }

        this.updateButtonStates()

        // Reset timelines
        if (this.state.progressTimeline) {
          this.state.progressTimeline.restart()
        }
        if (this.state.mainTimeline) {
          this.state.mainTimeline.restart()
        }

        setTimeout(() => {
          this.state.isNavigating = false
        }, CONFIG.NAVIGATION_DELAY)
      })
    }

    // Add event listeners
    this.elements.leftArrow.addEventListener('click', navigatePrev)
    this.elements.rightArrow.addEventListener('click', navigateNext)

    // Store references for cleanup
    this.elements.leftArrow._logoGridHandler = navigatePrev
    this.elements.rightArrow._logoGridHandler = navigateNext

    this.updateButtonStates()
  }

  setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: this.root,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => this.state.mainTimeline?.play(),
      onLeave: () => this.state.mainTimeline?.pause(),
      onEnterBack: () => this.state.mainTimeline?.play(),
      onLeaveBack: () => this.state.mainTimeline?.pause(),
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.state.mainTimeline?.pause()
      } else {
        this.state.mainTimeline?.play()
      }
    })
  }

  destroy() {
    if (this.state.mainTimeline) {
      this.state.mainTimeline.kill()
    }
    if (this.state.progressTimeline) {
      this.state.progressTimeline.kill()
    }

    // Remove event listeners
    if (this.elements.leftArrow?._logoGridHandler) {
      this.elements.leftArrow.removeEventListener('click', this.elements.leftArrow._logoGridHandler)
      delete this.elements.leftArrow._logoGridHandler
    }
    if (this.elements.rightArrow?._logoGridHandler) {
      this.elements.rightArrow.removeEventListener('click', this.elements.rightArrow._logoGridHandler)
      delete this.elements.rightArrow._logoGridHandler
    }
  }
}

function initLogoCycle() {
  document.querySelectorAll('[data-anm-logo-grid="section"]').forEach(root => {
    const manager = new LogoGridManager(root)
    logoTimelines.set(root, manager.state.mainTimeline)
    root._logoGridManager = manager // Store reference for cleanup
  })
}

function cleanup() {
  // Clean up all logo grid managers
  logoTimelines.forEach((tl, root) => {
    // Find the manager instance and destroy it properly
    const manager = root._logoGridManager
    if (manager) {
      manager.destroy()
      delete root._logoGridManager
    } else {
      // Fallback: just kill the timeline
      tl?.kill()
    }
  })
  logoTimelines.clear()

  // Clean up any remaining event listeners
  document.querySelectorAll('[data-anm-logo-grid="arrow-left"], [data-anm-logo-grid="arrow-right"]').forEach(arrow => {
    if (arrow._logoGridHandler) {
      arrow.removeEventListener('click', arrow._logoGridHandler)
      delete arrow._logoGridHandler
    }
  })

  if (ctx) {
    ctx.revert()
  }
}

export default {
  init,
  cleanup,
}
