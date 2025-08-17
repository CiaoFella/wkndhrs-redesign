import { gsap, ScrollTrigger } from '../../vendor.js'
import { createRAFScrollHandler } from '../../utilities/helper.js'

let ctx
let scrollTriggers = []
let scrollHandler = null

function init() {
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  const hideTrigger = document.querySelector('[data-anm-navbar="hide-trigger"]')

  if (!navbar || !hideTrigger) {
    return
  }

  ctx = gsap.context(() => {
    // ScrollTrigger for detecting when we pass the hide-trigger
    const passTrigger = ScrollTrigger.create({
      trigger: hideTrigger,
      start: () => {
        // Calculate when navbar center will hit trigger bottom
        const navbarRect = navbar.getBoundingClientRect()
        const navbarCenterOffset = navbarRect.height / 2

        // Start trigger when the center of navbar hits the bottom of trigger
        return `bottom+=${navbarCenterOffset} top`
      },
      toggleActions: 'play none reverse none',
      onEnter: () => {
        // Only add classes when actually scrolling past (not on initial load)
        navbar.classList.add('is-hidden')
        navbar.classList.add('is-scrolled-past')
        navbar.classList.add('u-blurry-bg')
      },
      onLeaveBack: () => {
        navbar.classList.remove('is-hidden')
        navbar.classList.remove('is-scrolled-past')
        navbar.classList.remove('u-blurry-bg')
      },
      onRefresh: () => {
        // Handle initial state without triggering animations
        // This runs after ScrollTrigger calculates positions
        const triggerRect = hideTrigger.getBoundingClientRect()
        const navbarRect = navbar.getBoundingClientRect()
        const navbarCenter = navbarRect.top + navbarRect.height / 2
        const isPastTrigger = navbarCenter >= triggerRect.bottom

        if (isPastTrigger) {
          // On initial load, if we're past trigger, add classes without animation
          navbar.classList.add('is-scrolled-past')
          navbar.classList.add('u-blurry-bg')
          // Don't add is-hidden on initial load - let scroll behavior handle it
        } else {
          // Ensure classes are removed if we're above trigger
          navbar.classList.remove('is-hidden')
          navbar.classList.remove('is-scrolled-past')
          navbar.classList.remove('u-blurry-bg')
        }
      },
    })

    // Use RAF scroll handler utility following MDN best practices
    let lastScrollY = window.scrollY

    const updateNavbarOnScroll = (timestamp, deltaTime) => {
      const currentScrollY = window.scrollY
      const scrollDirection = currentScrollY > lastScrollY ? 1 : -1

      // Check if we're past the hide-trigger
      const triggerRect = hideTrigger.getBoundingClientRect()
      const navbarRect = navbar.getBoundingClientRect()
      const navbarCenter = navbarRect.top + navbarRect.height / 2
      const isPastTrigger = navbarCenter >= triggerRect.bottom

      if (isPastTrigger) {
        if (scrollDirection === 1 && currentScrollY > lastScrollY) {
          // Scrolling down - hide navbar
          navbar.classList.add('is-hidden')
        } else if (scrollDirection === -1 && currentScrollY < lastScrollY) {
          // Scrolling up - show navbar
          navbar.classList.remove('is-hidden')
        }
      }

      lastScrollY = currentScrollY
    }

    // Create RAF-based scroll handler
    scrollHandler = createRAFScrollHandler(updateNavbarOnScroll, { passive: true })
    scrollHandler.start()

    scrollTriggers.push(passTrigger)
  })
}

function cleanup() {
  // Clean up all scroll triggers
  scrollTriggers.forEach(trigger => {
    trigger.kill()
  })
  scrollTriggers = []

  // Clean up RAF scroll handler
  if (scrollHandler) {
    scrollHandler.stop()
    scrollHandler = null
  }

  // Revert GSAP context
  ctx && ctx.revert()

  // Remove all possible classes that might have been added
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  if (navbar) {
    // Remove common classes that might be used
    const possibleClasses = [
      'is-hidden',
      'is-dark',
      'is-light',
      'is-transparent',
      'navbar-alt-style',
      'is-scroll-hidden',
      'is-scrolled-past',
      'u-blurry-bg',
    ]
    possibleClasses.forEach(className => {
      navbar.classList.remove(className)
    })

    // Also remove any custom color classes by checking all hide-trigger elements
    document.querySelectorAll('[data-anm-navbar="hide-trigger"]').forEach(trigger => {
      const colorClass = trigger.getAttribute('data-navbar-color-class')
      if (colorClass) {
        navbar.classList.remove(colorClass)
      }
    })
  }
}

export default {
  init,
  cleanup,
}
