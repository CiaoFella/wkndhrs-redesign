import { gsap, Flip, ScrollTrigger } from '../../vendor.js'

let ctx
let cleanupFunctions = []
let persistentNavInstances = new Map() // Store persistent navigation instances

function setupScrollActiveDetection(wrap, links, onActiveLinkChange) {
  const updateActiveLink = activeLink => {
    links.forEach(l => {
      l.classList.remove('is-active', 'w--current')
    })

    activeLink.classList.add('is-active', 'w--current')

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

    if (onActiveLinkChange) {
      onActiveLinkChange(activeLink)
    }
  }

  requestAnimationFrame(() => {
    links.forEach(link => {
      const href = link.getAttribute('href')

      if (href && href.startsWith('#')) {
        const targetId = href.substring(1)
        let targetSection = document.getElementById(targetId)

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

  cleanupFunctions = []

  ctx = gsap.context(() => {
    flipWraps.forEach(wrap => {
      const barbaContainer = document.querySelector('[data-barba="container"]')
      const isPersistent = !barbaContainer || !barbaContainer.contains(wrap)

      const isMobileNav = wrap.closest('[data-anm-navbar-mobile="navigation"]')

      if (isPersistent && persistentNavInstances.has(wrap)) {
        return
      }
      const isSectionsNav = wrap.getAttribute('data-anm-type') === 'sections'
      const links = isSectionsNav
        ? wrap.querySelectorAll('[data-anm-flip-link="list"] a')
        : wrap.querySelectorAll('[data-anm-flip-link="list"] a')
      const bg = wrap.querySelector('[data-anm-flip-link="bg"]')

      // Skip flip background for mobile nav on tablet and below, but keep active class functionality
      const skipFlipAnimation = isMobileNav && window.innerWidth <= 768

      if (!skipFlipAnimation && (!bg || links.length === 0)) {
        return
      }

      if (skipFlipAnimation && links.length === 0) {
        return
      }

      // Find initially active link based on navigation type
      let activeLink

      if (isSectionsNav) {
        activeLink =
          wrap.querySelector('.services_list_nav_link.w--current') ||
          wrap.querySelector('.services_list_nav_link.is-active') ||
          links[0]

        links.forEach(link => {
          link.classList.remove('is-active', 'w--current')
        })
        activeLink.classList.add('is-active', 'w--current')

        setupScrollActiveDetection(wrap, links, newActiveLink => {
          activeLink = newActiveLink
        })
      } else {
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

      const setInitialPosition = () => {
        if (skipFlipAnimation) return

        const linkRect = activeLink.getBoundingClientRect()
        const listRect = wrap.querySelector('[data-anm-flip-link="list"]').getBoundingClientRect()

        gsap.set(bg, {
          width: linkRect.width,
          height: linkRect.height,
          x: linkRect.left - listRect.left,
          y: linkRect.top - listRect.top,
        })
      }

      setInitialPosition()

      const animateToLink = (targetLink, duration = 0.5) => {
        if (skipFlipAnimation) return

        const state = Flip.getState(bg)

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

      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          const currentActiveLink = isSectionsNav
            ? wrap.querySelector('.services_list_nav_link.is-active')
            : wrap.querySelector('.navbar_menu_link.is-active')

          if (link !== currentActiveLink) {
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
          const currentActiveLink = isSectionsNav
            ? wrap.querySelector('.services_list_nav_link.is-active')
            : wrap.querySelector('.navbar_menu_link.is-active')

          if (link === currentActiveLink && link !== activeLink) {
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

        if (!isSectionsNav) {
          link.addEventListener('click', e => {
            links.forEach(l => l.classList.remove('is-active'))

            link.classList.add('is-active')

            activeLink = link

            animateToLink(link, 0.6)
          })
        }
      })

      let resizeTimeout
      const handleResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          setInitialPosition()
        }, 250)
      }

      window.addEventListener('resize', handleResize)

      if (isPersistent) {
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
  cleanupFunctions.forEach(fn => fn())
  cleanupFunctions = []

  ctx && ctx.revert()
}

function updatePersistentNavigation() {
  persistentNavInstances.forEach((instance, wrap) => {
    const { links, isSectionsNav } = instance

    if (!isSectionsNav) {
      const currentPath = window.location.pathname
      const newActiveLink = Array.from(links).find(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname
        return linkPath === currentPath
      })

      if (newActiveLink) {
        links.forEach(link => link.classList.remove('is-active'))
        newActiveLink.classList.add('is-active')

        instance.activeLink = newActiveLink

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

function fullCleanup() {
  cleanup()

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
