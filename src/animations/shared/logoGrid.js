import { gsap, ScrollTrigger } from '../../vendor.js'

let ctx
let logoTimelines = new Map()

function init() {
  ctx = gsap.context(() => {
    // Initialize scroll line animations
    initScrollLines()

    // Initialize logo cycling
    initLogoCycle()
  })
}

function initScrollLines() {
  const scrollLineSections = document.querySelectorAll('[data-anm-scroll-line=section]')

  scrollLineSections.forEach(section => {
    const topLines = section.querySelectorAll('.g_scroll_line.is-top')
    const bottomLines = section.querySelectorAll('.g_scroll_line.is-bottom')
    const leftLines = section.querySelectorAll('.g_scroll_line.is-left')
    const rightLines = section.querySelectorAll('.g_scroll_line.is-right')

    const tl = gsap.timeline({
      defaults: {
        duration: 2,
        ease: 'expo.out',
      },
    })

    gsap.set([topLines, bottomLines], {
      scaleX: 0,
    })

    gsap.set([leftLines, rightLines], {
      scaleY: 0,
    })

    const allLines = section.querySelectorAll('.g_scroll_line')

    tl.to(allLines, {
      scaleX: function (index, target) {
        return target.classList.contains('is-top') || target.classList.contains('is-bottom') ? 1 : undefined
      },
      scaleY: function (index, target) {
        return target.classList.contains('is-left') || target.classList.contains('is-right') ? 1 : undefined
      },
      transformOrigin: function (index, target) {
        if (target.classList.contains('is-top')) return 'right center'
        if (target.classList.contains('is-bottom')) return 'left center'
        if (target.classList.contains('is-left')) return 'bottom center'
        if (target.classList.contains('is-right')) return 'top center'
        return 'center center'
      },
      stagger: {
        each: 0.15,
        from: [2, 0],
        grid: [3, 4],
        axis: 'y',
      },
    })

    // ScrollTrigger to play animation when section comes into view
    ScrollTrigger.create({
      animation: tl,
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none none',
    })
  })
}

function initLogoCycle() {
  const loopDelay = 1.5 // Loop Duration
  const duration = 1 // Animation Duration

  document.querySelectorAll('[data-anm-logo-grid="section"]').forEach(root => {
    const list = root.querySelector('[data-anm-logo-grid="list"]')
    const items = Array.from(list.querySelectorAll('[data-anm-logo-grid="item"]'))

    const shuffleFront = root.getAttribute('data-anm-logo-grid-shuffle') !== 'false'

    // Get original targets from the logo pool
    const originalTargets = Array.from(root.querySelectorAll('[data-anm-logo-grid="logo"]')).filter(Boolean)

    let visibleItems = []
    let visibleCount = 0
    let pool = []
    let pattern = []
    let patternIndex = 0
    let tl

    function isVisible(el) {
      return window.getComputedStyle(el).display !== 'none'
    }

    function shuffleArray(arr) {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    function setup() {
      if (tl) {
        tl.kill()
      }

      visibleItems = items.filter(isVisible)
      visibleCount = visibleItems.length

      pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i))
      patternIndex = 0

      // Remove all injected targets from grid items
      items.forEach(item => {
        const target = item.querySelector('[data-anm-logo-grid="target"]')
        if (target) {
          Array.from(target.children).forEach(child => child.remove())
        }
      })

      pool = originalTargets.map(n => n.cloneNode(true))

      let front, rest
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool)
        front = shuffledAll.slice(0, visibleCount)
        rest = shuffleArray(shuffledAll.slice(visibleCount))
      } else {
        front = pool.slice(0, visibleCount)
        rest = shuffleArray(pool.slice(visibleCount))
      }
      pool = front.concat(rest)

      for (let i = 0; i < visibleCount; i++) {
        const parent = visibleItems[i].querySelector('[data-anm-logo-grid="target-parent"]') || visibleItems[i]
        const target = parent.querySelector('[data-anm-logo-grid="target"]')
        const before = parent.querySelector('[data-anm-logo-grid="before"]')

        // Ensure the before element is present for proper spacing
        if (before && target && pool.length > 0) {
          target.appendChild(pool.shift())
        }
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay })
      tl.call(swapNext)
      tl.play()
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length
      if (nowCount !== visibleCount) {
        setup()
        return
      }
      if (!pool.length) return

      const idx = pattern[patternIndex % visibleCount]
      patternIndex++

      const container = visibleItems[idx]
      const parent =
        container.querySelector('[data-anm-logo-grid="target-parent"]') ||
        container.querySelector('*:has(> [data-anm-logo-grid="target"])') ||
        container
      const targetContainer = parent.querySelector('[data-anm-logo-grid="target"]')
      const before = parent.querySelector('[data-anm-logo-grid="before"]')

      // Ensure both before and target elements are present
      if (!targetContainer || !before) return

      const existing = targetContainer.children
      if (existing.length > 1) return

      const current = targetContainer.children[0]
      const incoming = pool.shift()

      if (!incoming) return

      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 })
      targetContainer.appendChild(incoming)

      if (current) {
        gsap.to(current, {
          yPercent: -50,
          autoAlpha: 0,
          duration,
          ease: 'expo.inOut',
          onComplete: () => {
            current.remove()
            pool.push(current)
          },
        })
      }

      gsap.to(incoming, {
        yPercent: 0,
        autoAlpha: 1,
        duration,
        delay: 0.1,
        ease: 'expo.inOut',
      })
    }

    setup()
    logoTimelines.set(root, tl)

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => tl.play(),
      onLeave: () => tl.pause(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.pause(),
    })

    document.addEventListener('visibilitychange', () => (document.hidden ? tl.pause() : tl.play()))
  })
}

function cleanup() {
  // Clean up logo timelines
  logoTimelines.forEach(tl => tl.kill())
  logoTimelines.clear()

  if (ctx) {
    ctx.revert()
  }
}

export default {
  init,
  cleanup,
}
