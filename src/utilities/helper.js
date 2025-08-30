import { gsap, ScrollTrigger } from '../vendor.js'
import { isDesktop, isLandscape, isMobile, isTablet } from './variables.js'

export function unwrapSpanAndPreserveClasses(element) {
  const spans = element.querySelectorAll('span')

  spans.forEach(span => {
    const spanClasses = span.className

    const fragment = document.createDocumentFragment()

    span.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/\s+/)

        words.forEach((word, index) => {
          const newSpan = document.createElement('span')
          newSpan.textContent = word

          if (spanClasses) {
            newSpan.className = spanClasses
          }

          fragment.appendChild(newSpan)
          if (index < words.length - 1) {
            fragment.appendChild(document.createTextNode(' '))
          }
        })
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        fragment.appendChild(node.cloneNode())
      }
    })

    span.replaceWith(fragment)
  })
}

export function closeMenu() {
  const menuTrigger = document.querySelector('[data-menu-mobile=trigger]')
  if (menuTrigger && menuTrigger.classList.contains('is-active')) {
    menuTrigger.click()
  }

  const navigationStatusEl = document.querySelector('[data-navigation-status]')
  if (navigationStatusEl && navigationStatusEl.getAttribute('data-navigation-status') === 'active') {
    navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
    import('../utilities/smoothScroll.js').then(({ getSmoothScroll }) => {
      const smoothScroll = getSmoothScroll()
      if (smoothScroll) {
        smoothScroll.start()
      }
    })
  }
}

export function closeMobileNavigation() {
  const navigationStatusEl = document.querySelector('[data-navigation-status]')
  if (navigationStatusEl && navigationStatusEl.getAttribute('data-navigation-status') === 'active') {
    navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
    import('../utilities/smoothScroll.js').then(({ getSmoothScroll }) => {
      const smoothScroll = getSmoothScroll()
      if (smoothScroll) {
        smoothScroll.start()
      }
    })
  }
}

export function getCurrentPage() {
  const currentPage = document.querySelector('[data-barba="container"]').dataset.barbaNamespace

  return currentPage
}

export function getNextPage() {
  const containers = document.querySelectorAll('[data-barba="container"]')

  if (containers.length === 1) {
    return containers[0].dataset.barbaNamespace
  } else if (containers.length === 2) {
    const currentContainer = document.querySelector('[data-barba="container"]:not(.is-animating)')
    const nextContainer = Array.from(containers).find(container => container !== currentContainer)

    return nextContainer ? nextContainer.dataset.barbaNamespace : containers[0].dataset.barbaNamespace
  }

  return getCurrentPage()
}

let mm

export function handleResponsiveElements() {
  if (mm) {
    mm.revert()
  }

  mm = gsap.matchMedia()

  const removedElementsMap = new Map()

  mm.add(isTablet, () => {
    handleElementRemoval('tablet')
  })

  mm.add(isLandscape, () => {
    handleElementRemoval('landscape')
  })

  mm.add(isMobile, () => {
    handleElementRemoval('mobile')
  })

  mm.add(isDesktop, () => {
    return () => {}
  })

  function handleElementRemoval(breakpoint) {
    document.querySelectorAll('[data-remove]').forEach(el => {
      const removeAt = el.getAttribute('data-remove')
      const parent = el.parentNode
      const nextSibling = el.nextElementSibling

      if (removeAt === breakpoint) {
        if (!removedElementsMap.has(el)) {
          removedElementsMap.set(el, { parent, nextSibling })
          parent.removeChild(el)
        }
      }
    })
  }
}

export function updateCurrentNavLink() {
  const currentPath = window.location.pathname

  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href')

    if (href === currentPath || href === currentPath + '/') {
      link.classList.add('w--current')
    } else {
      link.classList.remove('w--current')
    }
  })
}

/**
 * Creates a throttled scroll handler using requestAnimationFrame
 * @param {Function} callback - Function to call on scroll
 * @param {Object} options - Configuration options
 * @param {boolean} options.passive - Use passive event listener (default: true)
 * @returns {Object} - Object with start/stop methods and cleanup
 */
export function createRAFScrollHandler(callback, options = {}) {
  const { passive = true } = options

  let rafId = null
  let isScheduled = false
  let lastTimestamp = 0

  const handleScroll = timestamp => {
    const deltaTime = timestamp - lastTimestamp
    lastTimestamp = timestamp

    callback(timestamp, deltaTime)

    isScheduled = false
    rafId = null
  }

  const onScroll = () => {
    if (!isScheduled) {
      rafId = requestAnimationFrame(handleScroll)
      isScheduled = true
    }
  }

  const start = () => {
    window.addEventListener('scroll', onScroll, { passive })
  }

  const stop = () => {
    window.removeEventListener('scroll', onScroll)
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
      isScheduled = false
    }
  }

  return {
    start,
    stop,

    get isActive() {
      return rafId !== null
    },
    get isScheduled() {
      return isScheduled
    },
  }
}

/**
 * Creates a general RAF-based animation loop
 * @param {Function} callback - Animation callback receiving (timestamp, deltaTime, progress)x
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in ms (optional)
 * @param {boolean} options.autoStart - Start immediately (default: true)
 * @returns {Object} - Animation controller
 */
export function createRAFAnimation(callback, options = {}) {
  const { duration, autoStart = true } = options

  let rafId = null
  let startTime = null
  let isRunning = false

  const animate = timestamp => {
    if (startTime === null) {
      startTime = timestamp
    }

    const elapsed = timestamp - startTime
    const deltaTime = timestamp - (animate.lastTimestamp || timestamp)
    animate.lastTimestamp = timestamp

    let progress = duration ? Math.min(elapsed / duration, 1) : elapsed / 1000

    const shouldContinue = callback(timestamp, deltaTime, progress)

    if ((duration && progress < 1) || (!duration && shouldContinue !== false)) {
      rafId = requestAnimationFrame(animate)
    } else {
      stop()
    }
  }

  const start = () => {
    if (!isRunning) {
      isRunning = true
      startTime = null
      animate.lastTimestamp = null
      rafId = requestAnimationFrame(animate)
    }
  }

  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
      isRunning = false
      startTime = null
      animate.lastTimestamp = null
    }
  }

  const reset = () => {
    stop()
    if (autoStart) {
      start()
    }
  }

  if (autoStart) {
    start()
  }

  return {
    start,
    stop,
    reset,
    get isRunning() {
      return isRunning
    },
    get progress() {
      if (!startTime || !duration) return 0
      return Math.min((performance.now() - startTime) / duration, 1)
    },
  }
}
