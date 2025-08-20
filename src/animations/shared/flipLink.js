import { gsap, Flip, ScrollTrigger } from '../../vendor.js'

let ctx
let cleanupFunctions = []

// Function to set up scroll-based active state detection for services nav
function setupScrollActiveDetection(wrap, links, onActiveLinkChange) {
  const updateActiveLink = activeLink => {
    // Remove active classes from all links
    links.forEach(l => {
      l.classList.remove('is-active', 'w--current')
    })

    // Add active classes to current link
    activeLink.classList.add('is-active', 'w--current')

    // Update the active link reference and animate background
    const flipWrap = wrap.closest('[data-anm-flip-link="wrap"]') || wrap.closest('[data-anm-flip-list="wrap"]')
    if (flipWrap) {
      const bg = flipWrap.querySelector('[data-anm-flip-link="bg"]')
      if (bg) {
        const linkRect = activeLink.getBoundingClientRect()
        const listRect = flipWrap.querySelector('[data-anm-flip-link="list"]').getBoundingClientRect()

        const state = Flip.getState(bg)
        gsap.set(bg, {
          width: linkRect.width,
          height: linkRect.height,
          x: linkRect.left - listRect.left,
          y: linkRect.top - listRect.top,
        })

        Flip.from(state, {
          duration: 0.5,
          ease: 'power2.inOut',
        })
      }
    }

    // Notify parent about active link change
    if (onActiveLinkChange) {
      onActiveLinkChange(activeLink)
    }
  }

  links.forEach(link => {
    const href = link.getAttribute('href')
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1)
      const targetSection = document.getElementById(targetId)

      if (targetSection) {
        ScrollTrigger.create({
          trigger: targetSection,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => updateActiveLink(link),
          onEnterBack: () => updateActiveLink(link),
        })
      }
    }
  })
}

function init() {
  const flipWraps = document.querySelectorAll('[data-anm-flip-list="wrap"], [data-anm-flip-link="wrap"]')

  if (flipWraps.length === 0) {
    return
  }

  // Reset cleanup functions array
  cleanupFunctions = []

  ctx = gsap.context(() => {
    flipWraps.forEach(wrap => {
      // Determine navigation type and get appropriate links
      const isServicesNav = wrap.classList.contains('services_list_nav')
      const links = isServicesNav
        ? wrap.querySelectorAll('[data-anm-flip-link="list"] .services_list_nav_link')
        : wrap.querySelectorAll('[data-anm-flip-link="list"] .navbar_menu_link')
      const bg = wrap.querySelector('[data-anm-flip-link="bg"]')

      if (!bg || links.length === 0) {
        return
      }

      // Find initially active link based on navigation type
      let activeLink

      if (isServicesNav) {
        // For services nav, look for w--current class or first link
        activeLink =
          wrap.querySelector('.services_list_nav_link.w--current') ||
          wrap.querySelector('.services_list_nav_link.is-active') ||
          links[0]

        // Remove existing classes and set active
        links.forEach(link => {
          link.classList.remove('is-active', 'w--current')
        })
        activeLink.classList.add('is-active', 'w--current')

        // Set up scroll-based active state detection for services nav
        setupScrollActiveDetection(wrap, links, newActiveLink => {
          activeLink = newActiveLink // Update the activeLink reference
        })
      } else {
        // Original navbar logic
        activeLink = wrap.querySelector('.navbar_menu_link.is-active')

        if (!activeLink) {
          const currentPath = window.location.pathname
          activeLink = Array.from(links).find(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname
            return linkPath === currentPath
          })

          if (activeLink) {
            links.forEach(link => link.classList.remove('is-active'))
            activeLink.classList.add('is-active')
          } else {
            activeLink = links[0]
            links.forEach(link => link.classList.remove('is-active'))
            activeLink.classList.add('is-active')
          }
        }
      }

      // Set initial position of background to match active link
      const setInitialPosition = () => {
        const linkRect = activeLink.getBoundingClientRect()
        const listRect = wrap.querySelector('[data-anm-flip-link="list"]').getBoundingClientRect()

        gsap.set(bg, {
          width: linkRect.width,
          height: linkRect.height,
          x: linkRect.left - listRect.left,
          y: linkRect.top - listRect.top,
        })
      }

      // Set initial position
      setInitialPosition()

      // Function to animate background to target link
      const animateToLink = (targetLink, duration = 0.5) => {
        const state = Flip.getState(bg)

        // Temporarily position bg to match target link
        const targetRect = targetLink.getBoundingClientRect()
        const listRect = wrap.querySelector('[data-anm-flip-link="list"]').getBoundingClientRect()

        gsap.set(bg, {
          width: targetRect.width,
          height: targetRect.height,
          x: targetRect.left - listRect.left,
          y: targetRect.top - listRect.top,
        })

        Flip.from(state, {
          duration: duration,
          ease: 'power2.inOut',
        })
      }

      // Handle hover interactions
      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          // Get the current active link (may have changed due to scroll)
          const currentActiveLink = isServicesNav
            ? wrap.querySelector('.services_list_nav_link.is-active')
            : wrap.querySelector('.navbar_menu_link.is-active')

          if (link !== currentActiveLink) {
            // Remove active classes from current active link
            if (isServicesNav) {
              if (currentActiveLink) {
                currentActiveLink.classList.remove('is-active', 'w--current')
              }
              link.classList.add('is-active', 'w--current')
            } else {
              if (currentActiveLink) {
                currentActiveLink.classList.remove('is-active')
              }
              link.classList.add('is-active')
            }
            animateToLink(link, 0.3)
          }
        })

        link.addEventListener('mouseleave', () => {
          // Get the current active link (may have changed due to scroll)
          const currentActiveLink = isServicesNav
            ? wrap.querySelector('.services_list_nav_link.is-active')
            : wrap.querySelector('.navbar_menu_link.is-active')

          if (link === currentActiveLink && link !== activeLink) {
            // Remove active classes from hovered link
            if (isServicesNav) {
              link.classList.remove('is-active', 'w--current')
              activeLink.classList.add('is-active', 'w--current')
            } else {
              link.classList.remove('is-active')
              activeLink.classList.add('is-active')
            }
            animateToLink(activeLink, 0.3)
          }
        })

        // Handle click to set new active state (only for navbar, not services nav)
        if (!isServicesNav) {
          link.addEventListener('click', e => {
            // Remove is-active from all links
            links.forEach(l => l.classList.remove('is-active'))

            // Add is-active to clicked link
            link.classList.add('is-active')

            // Update activeLink reference
            activeLink = link

            // Animate to new active link
            animateToLink(link, 0.6)
          })
        }
      })

      // Handle window resize to recalculate positions
      let resizeTimeout
      const handleResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          setInitialPosition()
        }, 250)
      }

      window.addEventListener('resize', handleResize)

      // Store cleanup function
      cleanupFunctions.push(() => {
        window.removeEventListener('resize', handleResize)
      })
    })
  })
}

function cleanup() {
  // Run all stored cleanup functions
  cleanupFunctions.forEach(fn => fn())
  cleanupFunctions = []

  // Revert GSAP context
  ctx && ctx.revert()
}

export default {
  init,
  cleanup,
}
