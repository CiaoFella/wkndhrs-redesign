import { gsap, Flip, ScrollTrigger } from '../../vendor.js'

let ctx
let cleanupFunctions = []
let persistentNavInstances = new Map() // Store persistent navigation instances

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
          duration: 0.25,
          ease: 'power2.inOut',
        })
      }
    }

    // Notify parent about active link change
    if (onActiveLinkChange) {
      onActiveLinkChange(activeLink)
    }
  }

  // Add a small delay to ensure other ScrollTriggers are set up first
  requestAnimationFrame(() => {
    links.forEach(link => {
      const href = link.getAttribute('href')

      if (href && href.startsWith('#')) {
        const targetId = href.substring(1)
        let targetSection = document.getElementById(targetId)

        // If not found by ID, try looking for service list items
        if (!targetSection) {
          const serviceItems = document.querySelectorAll('[data-anm-service-list="item"]')

          serviceItems.forEach(item => {
            const itemTitle = item.querySelector('[data-anm-service-list="item-title"]')
            if (itemTitle && itemTitle.textContent.toLowerCase().includes(targetId.toLowerCase())) {
              targetSection = item
            }
          })
        }

        if (targetSection) {
          ScrollTrigger.create({
            trigger: targetSection,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => updateActiveLink(link),
            onEnterBack: () => updateActiveLink(link),
            // Remove markers and add proper invalidation
            invalidateOnRefresh: true,
            refreshPriority: -1,
          })
        }
      }
    })
  }, 0)
}

function init() {
  const flipWraps = document.querySelectorAll('[data-anm-flip-list="wrap"], [data-anm-flip-link="wrap"]')

  if (flipWraps.length === 0) {
    return
  }

  // Reset cleanup functions array for page-specific instances only
  cleanupFunctions = []

  ctx = gsap.context(() => {
    flipWraps.forEach(wrap => {
      // Check if this is a persistent navigation (outside barba container)
      const barbaContainer = document.querySelector('[data-barba="container"]')
      const isPersistent = !barbaContainer || !barbaContainer.contains(wrap)

      // If persistent and already initialized, skip
      if (isPersistent && persistentNavInstances.has(wrap)) {
        return
      }
      // Determine navigation type and get appropriate links
      const isSectionsNav = wrap.getAttribute('data-anm-type') === 'sections'
      const links = isSectionsNav
        ? wrap.querySelectorAll('[data-anm-flip-link="list"] a')
        : wrap.querySelectorAll('[data-anm-flip-link="list"] a')
      const bg = wrap.querySelector('[data-anm-flip-link="bg"]')

      if (!bg || links.length === 0) {
        return
      }

      // Find initially active link based on navigation type
      let activeLink

      if (isSectionsNav) {
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
          const currentActiveLink = isSectionsNav
            ? wrap.querySelector('.services_list_nav_link.is-active')
            : wrap.querySelector('.navbar_menu_link.is-active')

          if (link !== currentActiveLink) {
            // Remove active classes from current active link
            if (isSectionsNav) {
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
          const currentActiveLink = isSectionsNav
            ? wrap.querySelector('.services_list_nav_link.is-active')
            : wrap.querySelector('.navbar_menu_link.is-active')

          if (link === currentActiveLink && link !== activeLink) {
            // Remove active classes from hovered link
            if (isSectionsNav) {
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
        if (!isSectionsNav) {
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
      if (isPersistent) {
        // Store persistent instance data
        persistentNavInstances.set(wrap, {
          links,
          bg,
          activeLink,
          isSectionsNav,
          cleanupFn: () => {
            window.removeEventListener('resize', handleResize)
          },
        })
      } else {
        cleanupFunctions.push(() => {
          window.removeEventListener('resize', handleResize)
        })
      }
    })
  })
}

function cleanup() {
  // Run all stored cleanup functions (page-specific only)
  cleanupFunctions.forEach(fn => fn())
  cleanupFunctions = []

  // Revert GSAP context
  ctx && ctx.revert()
}

// Update active states for persistent navigation (called on page change)
function updatePersistentNavigation() {
  persistentNavInstances.forEach((instance, wrap) => {
    const { links, isSectionsNav } = instance

    if (!isSectionsNav) {
      // Update navbar active state based on current page
      const currentPath = window.location.pathname
      const newActiveLink = Array.from(links).find(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname
        return linkPath === currentPath
      })

      if (newActiveLink) {
        // Remove active from all links
        links.forEach(link => link.classList.remove('is-active'))
        // Add active to current page link
        newActiveLink.classList.add('is-active')

        // Update stored active link reference
        instance.activeLink = newActiveLink

        // Animate background to new position
        const { bg } = instance
        const linkRect = newActiveLink.getBoundingClientRect()
        const listRect = wrap.querySelector('[data-anm-flip-link="list"]').getBoundingClientRect()

        const state = Flip.getState(bg)
        gsap.set(bg, {
          width: linkRect.width,
          height: linkRect.height,
          x: linkRect.left - listRect.left,
          y: linkRect.top - listRect.top,
        })

        Flip.from(state, {
          duration: 0.25,
          ease: 'power2.inOut',
        })
      }
    }
  })
}

// Complete cleanup (including persistent navigation)
function fullCleanup() {
  // Cleanup page-specific instances
  cleanup()

  // Cleanup persistent instances
  persistentNavInstances.forEach(instance => {
    instance.cleanupFn()
  })
  persistentNavInstances.clear()
}

export default {
  init,
  cleanup,
  updatePersistentNavigation,
  fullCleanup,
}
