import { getNextPage } from '../../utilities/helper.js'
import { gsap, ScrollTrigger } from '../../vendor.js'
import { getScrollData } from '../../utilities/smoothScroll.js'

let ctx
let scrollTriggers = []

function init() {
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  const navbarBg = navbar ? navbar.querySelector('[data-anm-navbar="bg"]') : null

  // Look for hide-trigger in the next/target page container specifically
  const containers = document.querySelectorAll('[data-barba="container"]')
  let targetContainer
  let hideTrigger

  if (containers.length === 1) {
    // Initial load or transition complete - use the single container
    targetContainer = containers[0]
    hideTrigger = targetContainer.querySelector('[data-anm-navbar="hide-trigger"]')
  } else if (containers.length === 2) {
    // During transition - find the new container (the one being transitioned to)
    const currentContainer = document.querySelector('[data-barba="container"]:not(.is-animating)')
    targetContainer = Array.from(containers).find(container => container !== currentContainer) || containers[1]
    hideTrigger = targetContainer.querySelector('[data-anm-navbar="hide-trigger"]')
  } else {
    // Fallback - look in document
    hideTrigger = document.querySelector('[data-anm-navbar="hide-trigger"]')
  }

  if (!navbar) {
    console.warn('🚨 Navbar element not found')
    return
  }

  if (!hideTrigger) {
    console.warn('🚨 Hide-trigger element not found on target page', {
      containers: containers.length,
      targetContainer: targetContainer?.dataset?.barbaNamespace,
      nextPage: getNextPage(),
    })
    return
  }

  if (!navbarBg) {
    console.warn('🚨 Navbar background element not found')
    return
  }

  // Check current navbar state BEFORE resetting classes
  const currentlyDark = navbar.classList.contains('is-dark')

  // Get all flip-link bg elements
  const flipLinkBgElements = document.querySelectorAll('[data-anm-flip-link="bg"]')
  const flipLinkStates = Array.from(flipLinkBgElements).map(el => ({
    element: el,
    wasAlreadyDark: el.classList.contains('is-dark'),
  }))

  // Get current active link
  const activeLink = document.querySelector('.w--current') || document.querySelector('.is-active')
  const activeLinkWasAlreadyDark = activeLink ? activeLink.classList.contains('is-dark') : false

  // Reset navbar to initial state immediately (but preserve is-dark for now)
  navbar.classList.remove('is-hidden', 'is-scrolled-past')

  // Set initial background opacity to transparent
  gsap.set(navbarBg, { opacity: 0 })

  // Handle navbar type based on hide-trigger attribute
  const navbarType = hideTrigger.getAttribute('data-anm-navbar-type')

  // Apply dark/light class to navbar
  if (navbarType === 'dark' && !currentlyDark) {
    // Only add is-dark if it's not already there
    navbar.classList.add('is-dark')
  } else if (navbarType === 'light' && currentlyDark) {
    // Only remove is-dark if it's currently there
    navbar.classList.remove('is-dark')
  }

  // Apply transparent classes based on navbar type
  if (navbarType === 'transparent-light') {
    navbar.classList.add('is-transparent-light')
  } else if (navbarType === 'transparent-dark') {
    navbar.classList.add('is-transparent-dark')
  }

  // Apply dark/light class to flip-link bg elements
  flipLinkStates.forEach(({ element, wasAlreadyDark }) => {
    if (navbarType === 'dark' && !wasAlreadyDark) {
      // Only add is-dark if it's not already there
      element.classList.add('is-dark')
    } else if (navbarType === 'light' && wasAlreadyDark) {
      // Only remove is-dark if it's currently there
      element.classList.remove('is-dark')
    }
  })

  // Apply dark/light class to active link
  if (activeLink) {
    if (navbarType === 'dark' && !activeLinkWasAlreadyDark) {
      // Only add is-dark if it's not already there
      activeLink.classList.add('is-dark')
    } else if (navbarType === 'light' && activeLinkWasAlreadyDark) {
      // Only remove is-dark if it's currently there
      activeLink.classList.remove('is-dark')
    }
  }

  ctx = gsap.context(() => {
    // Get the hide-trigger height once for consistent behavior across both ScrollTriggers
    const triggerHeight = hideTrigger.offsetHeight
    const scrollThreshold = triggerHeight // Use trigger height as the scroll distance

    // ScrollTrigger for detecting when we pass the hide-trigger
    const passTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: `${scrollThreshold}px top`, // Start when we've scrolled the height of the trigger
      toggleActions: 'play none reverse none',
      onEnter: () => {
        navbar.classList.add('is-scrolled-past')
        // Remove transparent classes when scrolled past the trigger
        navbar.classList.remove('is-transparent-light', 'is-transparent-dark')
        gsap.to(navbarBg, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      },
      onLeaveBack: () => {
        navbar.classList.remove('is-hidden')
        navbar.classList.remove('is-scrolled-past')
        // Re-add transparent classes when going back above the trigger
        if (navbarType === 'transparent-light') {
          navbar.classList.add('is-transparent-light')
        } else if (navbarType === 'transparent-dark') {
          navbar.classList.add('is-transparent-dark')
        }
        gsap.to(navbarBg, { opacity: 0, duration: 0.3, ease: 'power2.out' })
      },
      onRefresh: () => {
        // Handle initial state without triggering animations
        // Wait for layout to settle and use consistent positioning
        requestAnimationFrame(() => {
          // Use the hide-trigger height as threshold for consistency
          const currentScrollY = window.scrollY
          const isPastTrigger = currentScrollY >= scrollThreshold

          if (isPastTrigger && currentScrollY > 50) {
            navbar.classList.add('is-scrolled-past')
            // Remove transparent classes when past trigger
            navbar.classList.remove('is-transparent-light', 'is-transparent-dark')
            gsap.set(navbarBg, { opacity: 1 })
          } else {
            // Ensure classes are removed if we're above trigger or near top
            navbar.classList.remove('is-hidden')
            navbar.classList.remove('is-scrolled-past')
            // Re-add transparent classes when above trigger
            if (navbarType === 'transparent-light') {
              navbar.classList.add('is-transparent-light')
            } else if (navbarType === 'transparent-dark') {
              navbar.classList.add('is-transparent-dark')
            }
            gsap.set(navbarBg, { opacity: 0 })
          }
        })
      },
    })

    // Use Locomotive Scroll's direction from scrollCallback for hide/show behavior
    let hideShowRAF = null
    let isHandlingScroll = false

    function handleScrollDirection() {
      if (isHandlingScroll) return

      isHandlingScroll = true

      const scrollData = getScrollData()
      const currentScrollY = scrollData.scroll
      const direction = scrollData.direction // 1 for down, -1 for up
      const isPastTrigger = currentScrollY >= scrollThreshold
      const hasHiddenClass = navbar.classList.contains('is-hidden')

      if (isPastTrigger) {
        if (direction === 1 && !hasHiddenClass) {
          // Scrolling down - hide navbar
          navbar.classList.add('is-hidden')
        } else if (direction === -1 && hasHiddenClass) {
          // Scrolling up - show navbar
          navbar.classList.remove('is-hidden')
        }
      } else {
        if (hasHiddenClass) {
          // If we're not past the trigger, ensure navbar is visible
          navbar.classList.remove('is-hidden')
        }
      }

      isHandlingScroll = false
      hideShowRAF = requestAnimationFrame(handleScrollDirection)
    }

    // Start the scroll direction handler
    hideShowRAF = requestAnimationFrame(handleScrollDirection)

    // Store RAF ID for cleanup
    scrollTriggers.push(passTrigger, { kill: () => cancelAnimationFrame(hideShowRAF) })
  })
}

function cleanup() {
  // Clean up all scroll triggers and RAF
  scrollTriggers.forEach(trigger => {
    if (trigger.kill) {
      trigger.kill()
    }
  })
  scrollTriggers = []

  // Revert GSAP context
  ctx && ctx.revert()

  // Remove all possible classes that might have been added and reset to initial state
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  if (navbar) {
    // Remove common classes that might be used
    const possibleClasses = [
      'is-hidden',
      'is-dark',
      'is-light',
      'is-transparent',
      'is-transparent-light',
      'is-transparent-dark',
      'navbar-alt-style',
      'is-scroll-hidden',
      'is-scrolled-past',
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

    // Reset any inline styles that might have been applied
    navbar.style.transform = ''
    navbar.style.transition = ''

    const navbarBg = navbar.querySelector('[data-anm-navbar="bg"]')
    if (navbarBg) {
      gsap.set(navbarBg, { opacity: 0 })
    }
  }

  // Clean up flip-link bg elements as well
  const flipLinkBgElements = document.querySelectorAll('[data-anm-flip-link="bg"]')
  flipLinkBgElements.forEach(element => {
    element.classList.remove('is-dark', 'is-light')
  })

  // Clean up active link as well
  const activeLink = document.querySelector('.w--current') || document.querySelector('.is-active')
  if (activeLink) {
    activeLink.classList.remove('is-dark', 'is-light')
  }
}

function hideForTransition() {
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  if (navbar) {
    navbar.classList.add('is-hidden')
  }
}

function showAfterTransition() {
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  if (navbar) {
    navbar.classList.remove('is-hidden')
  }
}

export default {
  init,
  cleanup,
  hideForTransition,
  showAfterTransition,
}
