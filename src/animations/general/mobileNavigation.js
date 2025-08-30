import { getSmoothScroll } from '../../utilities/smoothScroll.js'
import { gsap } from '../../vendor.js'

let ctx
let navigationStatusEl = null

function init() {
  const mobileMenuWrap = document.querySelector('[data-anm-navbar-mobile="wrap"]')

  if (mobileMenuWrap) {
    navigationStatusEl = mobileMenuWrap
    if (!navigationStatusEl.hasAttribute('data-navigation-status')) {
      navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
    }
  } else {
    navigationStatusEl = document.querySelector('[data-navigation-status]')
    if (!navigationStatusEl) {
      navigationStatusEl = document.createElement('div')
      navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
      navigationStatusEl.style.display = 'none'
      document.body.appendChild(navigationStatusEl)
    }
  }

  const toggleBtn = document.querySelector('[data-anm-navbar-mobile="toggle"]')
  const closeBtn = document.querySelector('[data-anm-navbar-mobile="close"]')
  const navigationLinks = document.querySelectorAll('[data-anm-navbar-mobile="navigation"] a')

  if (!navigationStatusEl || !toggleBtn) {
    return
  }

  navigationStatusEl.setAttribute('data-navigation-status', 'not-active')

  ctx = gsap.context(() => {
    toggleBtn.addEventListener('click', e => {
      const currentStatus = navigationStatusEl.getAttribute('data-navigation-status')
      const smoothScroll = getSmoothScroll()

      if (currentStatus === 'not-active') {
        navigationStatusEl.setAttribute('data-navigation-status', 'active')
        if (smoothScroll) {
          smoothScroll.stop()
        }
      } else {
        navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
        if (smoothScroll) {
          smoothScroll.start()
        }
      }
    })

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
        const smoothScroll = getSmoothScroll()
        if (smoothScroll) {
          smoothScroll.start()
        }
      })
    }

    navigationLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href')

        if (href && !href.startsWith('#')) {
          const flipWrap = link.closest('[data-anm-flip-link="wrap"]')
          const isCurrentlyActive = link.classList.contains('is-active') || link.classList.contains('w--current')

          if (flipWrap && !isCurrentlyActive) {
            requestAnimationFrame(() => {
              setTimeout(() => {
                navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
                const smoothScroll = getSmoothScroll()
                if (smoothScroll) {
                  smoothScroll.start()
                }
              }, 200)
            })
          } else {
            navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
            const smoothScroll = getSmoothScroll()
            if (smoothScroll) {
              smoothScroll.start()
            }
          }
        }
      })
    })

    const handleKeyDown = e => {
      if (e.keyCode === 27) {
        const currentStatus = navigationStatusEl.getAttribute('data-navigation-status')
        if (currentStatus === 'active') {
          navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
          const smoothScroll = getSmoothScroll()
          if (smoothScroll) {
            smoothScroll.start()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })
}

function cleanup() {
  ctx && ctx.revert()

  if (navigationStatusEl) {
    navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
  }

  const smoothScroll = getSmoothScroll()
  if (smoothScroll) {
    smoothScroll.start()
  }
}

function closeMenu() {
  if (navigationStatusEl) {
    const currentStatus = navigationStatusEl.getAttribute('data-navigation-status')
    if (currentStatus === 'active') {
      navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
      const smoothScroll = getSmoothScroll()
      if (smoothScroll) {
        smoothScroll.start()
      }
    }
  }
}

function isMenuOpen() {
  return navigationStatusEl && navigationStatusEl.getAttribute('data-navigation-status') === 'active'
}

export default {
  init,
  cleanup,
  closeMenu,
  isMenuOpen,
}
