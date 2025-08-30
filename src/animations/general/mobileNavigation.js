import { getSmoothScroll } from '../../utilities/smoothScroll.js'
import { gsap } from '../../vendor.js'

let ctx
let navigationStatusEl = null

function init() {
  console.log('🚀 Mobile navigation init called')

  // Use the mobile menu wrap as the navigation status element
  const mobileMenuWrap = document.querySelector('[data-anm-navbar-mobile="wrap"]')
  console.log('🔍 Mobile menu wrap found:', !!mobileMenuWrap, mobileMenuWrap)

  if (mobileMenuWrap) {
    navigationStatusEl = mobileMenuWrap
    console.log('✅ Using mobile menu wrap as navigation status element')
    // Ensure it has the navigation status attribute
    if (!navigationStatusEl.hasAttribute('data-navigation-status')) {
      navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
      console.log('➕ Added data-navigation-status attribute')
    } else {
      console.log(
        '✅ data-navigation-status attribute already exists:',
        navigationStatusEl.getAttribute('data-navigation-status')
      )
    }
  } else {
    console.log('⚠️ Mobile menu wrap not found, looking for fallback')
    // Fallback: create separate navigation status element
    navigationStatusEl = document.querySelector('[data-navigation-status]')
    if (!navigationStatusEl) {
      navigationStatusEl = document.createElement('div')
      navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
      navigationStatusEl.style.display = 'none'
      document.body.appendChild(navigationStatusEl)
      console.log('➕ Created fallback navigation status element')
    }
  }

  const toggleBtn = document.querySelector('[data-anm-navbar-mobile="toggle"]')
  const closeBtn = document.querySelector('[data-anm-navbar-mobile="close"]')
  const navigationLinks = document.querySelectorAll('[data-anm-navbar-mobile="navigation"] a')

  console.log('🔍 Elements found:', {
    navigationStatusEl: !!navigationStatusEl,
    toggleBtn: !!toggleBtn,
    closeBtn: !!closeBtn,
    navigationLinks: navigationLinks.length,
  })

  if (!navigationStatusEl || !toggleBtn) {
    console.warn('🚨 Mobile navigation elements not found', {
      navigationStatusEl: !!navigationStatusEl,
      toggleBtn: !!toggleBtn,
    })
    return
  }

  // Set initial state
  navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
  console.log('🔧 Initial state set. Element classes:', navigationStatusEl.className)
  console.log('🔧 Element HTML:', navigationStatusEl.outerHTML.substring(0, 200) + '...')

  ctx = gsap.context(() => {
    // Toggle Navigation
    console.log('🎯 Adding click event listener to toggle button:', toggleBtn)
    toggleBtn.addEventListener('click', e => {
      console.log('🖱️ Toggle button clicked!', e)
      const currentStatus = navigationStatusEl.getAttribute('data-navigation-status')
      const smoothScroll = getSmoothScroll()

      console.log('📊 Current status before toggle:', currentStatus)
      console.log('🔄 Smooth scroll instance:', smoothScroll)

      if (currentStatus === 'not-active') {
        navigationStatusEl.setAttribute('data-navigation-status', 'active')
        console.log('✅ Menu opened - status set to active')
        if (smoothScroll) {
          smoothScroll.stop()
          console.log('⏹️ Smooth scroll stopped')
        }
      } else {
        navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
        console.log('✅ Menu closed - status set to not-active')
        if (smoothScroll) {
          smoothScroll.start()
          console.log('▶️ Smooth scroll started')
        }
      }
    })

    // Close Navigation (if close button exists)
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
        const smoothScroll = getSmoothScroll()
        if (smoothScroll) {
          smoothScroll.start()
        }
      })
    }

    // Close navigation when clicking on navigation links
    navigationLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href')

        // Only close menu if it's a page navigation (not anchor links)
        if (href && !href.startsWith('#')) {
          // Check if this link will trigger a flip animation
          const flipWrap = link.closest('[data-anm-flip-link="wrap"]')
          const isCurrentlyActive = link.classList.contains('is-active') || link.classList.contains('w--current')

          if (flipWrap && !isCurrentlyActive) {
            // This will trigger a flip animation, wait for it to complete
            // The flip animation duration is 0.6s as per flipLink.js click duration

            // Allow the flip animation to start
            requestAnimationFrame(() => {
              // Wait for the flip animation to complete
              setTimeout(() => {
                navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
                const smoothScroll = getSmoothScroll()
                if (smoothScroll) {
                  smoothScroll.start()
                }
              }, 200) // 650ms to ensure flip animation completes (600ms + buffer)
            })
          } else {
            // No flip animation or already active link, close immediately
            navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
            const smoothScroll = getSmoothScroll()
            if (smoothScroll) {
              smoothScroll.start()
            }
          }
        }
      })
    })

    // Key ESC - Close Navigation
    const handleKeyDown = e => {
      if (e.keyCode === 27) {
        // ESC key
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

    // Store cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })
}

function cleanup() {
  // Revert GSAP context (this will call the cleanup function returned above)
  ctx && ctx.revert()

  // Reset navigation status
  if (navigationStatusEl) {
    navigationStatusEl.setAttribute('data-navigation-status', 'not-active')
  }

  // Ensure smooth scroll is restarted if it was stopped
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

console.log('📦 Mobile navigation module loaded')

export default {
  init,
  cleanup,
  closeMenu,
  isMenuOpen,
}
