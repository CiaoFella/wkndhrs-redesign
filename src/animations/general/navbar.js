import { getNextPage } from '../../utilities/helper.js'
import { gsap, ScrollTrigger } from '../../vendor.js'
import { getScrollData } from '../../utilities/smoothScroll.js'

let ctx
let scrollTriggers = []

function init() {
  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  const navbarBg = navbar ? navbar.querySelector('[data-anm-navbar="bg"]') : null

  const containers = document.querySelectorAll('[data-barba="container"]')
  let targetContainer
  let hideTrigger

  if (containers.length === 1) {
    targetContainer = containers[0]
    hideTrigger = targetContainer.querySelector('[data-anm-navbar="hide-trigger"]')
  } else if (containers.length === 2) {
    const currentContainer = document.querySelector('[data-barba="container"]:not(.is-animating)')
    targetContainer = Array.from(containers).find(container => container !== currentContainer) || containers[1]
    hideTrigger = targetContainer.querySelector('[data-anm-navbar="hide-trigger"]')
  } else {
    hideTrigger = document.querySelector('[data-anm-navbar="hide-trigger"]')
  }

  if (!navbar) {
    return
  }

  if (!hideTrigger) {
    return
  }

  if (!navbarBg) {
    return
  }

  const currentlyDark = navbar.classList.contains('is-dark')

  const flipLinkBgElements = document.querySelectorAll('[data-anm-flip-link="bg"]')
  const flipLinkStates = Array.from(flipLinkBgElements).map(el => ({
    element: el,
    wasAlreadyDark: el.classList.contains('is-dark'),
  }))

  const activeLink = document.querySelector('.w--current') || document.querySelector('.is-active')
  const activeLinkWasAlreadyDark = activeLink ? activeLink.classList.contains('is-dark') : false

  navbar.classList.remove('is-hidden', 'is-scrolled-past')

  gsap.set(navbarBg, { opacity: 0 })

  const navbarType = hideTrigger.getAttribute('data-anm-navbar-type')

  if (navbarType === 'dark' && !currentlyDark) {
    navbar.classList.add('is-dark')
  } else if (navbarType === 'light' && currentlyDark) {
    navbar.classList.remove('is-dark')
  }

  if (navbarType === 'transparent-light') {
    navbar.classList.add('is-transparent-light')
  } else if (navbarType === 'transparent-dark') {
    navbar.classList.add('is-transparent-dark')
  }

  flipLinkStates.forEach(({ element, wasAlreadyDark }) => {
    if (navbarType === 'dark' && !wasAlreadyDark) {
      element.classList.add('is-dark')
    } else if (navbarType === 'light' && wasAlreadyDark) {
      element.classList.remove('is-dark')
    }
  })

  if (activeLink) {
    if (navbarType === 'dark' && !activeLinkWasAlreadyDark) {
      activeLink.classList.add('is-dark')
    } else if (navbarType === 'light' && activeLinkWasAlreadyDark) {
      activeLink.classList.remove('is-dark')
    }
  }

  ctx = gsap.context(() => {
    const triggerHeight = hideTrigger.offsetHeight
    const scrollThreshold = triggerHeight // Use trigger height as the scroll distance

    const passTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: `${scrollThreshold}px top`,
      toggleActions: 'play none reverse none',
      onEnter: () => {
        navbar.classList.add('is-scrolled-past')
        navbar.classList.remove('is-transparent-light', 'is-transparent-dark')
        gsap.to(navbarBg, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      },
      onLeaveBack: () => {
        navbar.classList.remove('is-hidden')
        navbar.classList.remove('is-scrolled-past')
        if (navbarType === 'transparent-light') {
          navbar.classList.add('is-transparent-light')
        } else if (navbarType === 'transparent-dark') {
          navbar.classList.add('is-transparent-dark')
        }
        gsap.to(navbarBg, { opacity: 0, duration: 0.3, ease: 'power2.out' })
      },
      onRefresh: () => {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const isPastTrigger = currentScrollY >= scrollThreshold

          if (isPastTrigger && currentScrollY > 50) {
            navbar.classList.add('is-scrolled-past')
            navbar.classList.remove('is-transparent-light', 'is-transparent-dark')
            gsap.set(navbarBg, { opacity: 1 })
          } else {
            navbar.classList.remove('is-hidden')
            navbar.classList.remove('is-scrolled-past')
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
          navbar.classList.add('is-hidden')
        } else if (direction === -1 && hasHiddenClass) {
          navbar.classList.remove('is-hidden')
        }
      } else {
        if (hasHiddenClass) {
          navbar.classList.remove('is-hidden')
        }
      }

      isHandlingScroll = false
      hideShowRAF = requestAnimationFrame(handleScrollDirection)
    }

    hideShowRAF = requestAnimationFrame(handleScrollDirection)

    scrollTriggers.push(passTrigger, { kill: () => cancelAnimationFrame(hideShowRAF) })
  })
}

function cleanup() {
  scrollTriggers.forEach(trigger => {
    if (trigger.kill) {
      trigger.kill()
    }
  })
  scrollTriggers = []

  ctx && ctx.revert()

  const navbar = document.querySelector('[data-anm-navbar="wrap"]')
  if (navbar) {
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

    document.querySelectorAll('[data-anm-navbar="hide-trigger"]').forEach(trigger => {
      const colorClass = trigger.getAttribute('data-navbar-color-class')
      if (colorClass) {
        navbar.classList.remove(colorClass)
      }
    })

    navbar.style.transform = ''
    navbar.style.transition = ''

    const navbarBg = navbar.querySelector('[data-anm-navbar="bg"]')
    if (navbarBg) {
      gsap.set(navbarBg, { opacity: 0 })
    }
  }

  const flipLinkBgElements = document.querySelectorAll('[data-anm-flip-link="bg"]')
  flipLinkBgElements.forEach(element => {
    element.classList.remove('is-dark', 'is-light')
  })

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
