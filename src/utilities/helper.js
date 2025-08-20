import { gsap, ScrollTrigger } from '../vendor.js'
import { isDesktop, isLandscape, isMobile, isTablet } from './variables.js'

export function unwrapSpanAndPreserveClasses(element) {
  // Select all span elements inside the given element
  const spans = element.querySelectorAll('span')

  // Iterate over each span
  spans.forEach(span => {
    // Get the class list of the span
    const spanClasses = span.className

    // Create a document fragment to hold the new elements
    const fragment = document.createDocumentFragment()

    // Iterate over child nodes to preserve <br> elements
    span.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split the text content into words
        const words = node.textContent.split(/\s+/)

        words.forEach((word, index) => {
          // Create a new span for each word
          const newSpan = document.createElement('span')
          newSpan.textContent = word

          // Add the original span's classes to the new span
          if (spanClasses) {
            newSpan.className = spanClasses
          }

          // Append the new span and a space after the word (if it's not the last word)
          fragment.appendChild(newSpan)
          if (index < words.length - 1) {
            fragment.appendChild(document.createTextNode(' '))
          }
        })
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        // Preserve <br> elements
        fragment.appendChild(node.cloneNode())
      }
    })

    // Replace the original span with the new fragment
    span.replaceWith(fragment)
  })
}

export function closeMenu() {
  const menuTrigger = document.querySelector('[data-menu-mobile=trigger]')

  if (!menuTrigger) return

  if (menuTrigger.classList.contains('is-active')) {
    menuTrigger.click()
  }
}

export function getCurrentPage() {
  const currentPage = document.querySelector('[data-barba="container"]').dataset.barbaNamespace

  return currentPage
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
      const removeAt = el.getAttribute('data-remove') // e.g., "tablet", "landscape", "mobile"
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
      link.classList.add('w--current') // Webflow uses 'w--current' for the 'current' class
    } else {
      link.classList.remove('w--current')
    }
  })
}

/**
 * Creates a throttled scroll handler using requestAnimationFrame
 * Following MDN best practices for RAF usage
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
    // Use timestamp parameter for frame-rate independent calculations
    const deltaTime = timestamp - lastTimestamp
    lastTimestamp = timestamp

    // Call the user callback with timestamp and deltaTime
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
    // Expose current state for debugging
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
 * @param {Function} callback - Animation callback receiving (timestamp, deltaTime, progress)
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

    // Call user callback with timestamp, deltaTime, and progress
    const shouldContinue = callback(timestamp, deltaTime, progress)

    // Continue animation if duration not reached or callback returns true
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
