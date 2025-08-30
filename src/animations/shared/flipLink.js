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

      if (!bg || links.length === 0) {
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
        const linkRect = activeLink.getBoundingClientRect()
        const listRect = wrap.querySelector('[data-anm-flip-link="list"]').getBoundingClientRect()

        gsap.set(bg, {
          width: linkRect.width,
          height: linkRect.height,
          x: linkRect.left - listRect.left,
          y: linkRect.top - listRect.top,
        })
      }

      if (isMobileNav) {
        const mobileMenuWrap = isMobileNav.closest('[data-navigation-status]')
        const isMenuActive = mobileMenuWrap && mobileMenuWrap.getAttribute('data-navigation-status') === 'active'

        if (isMenuActive) {
          setInitialPosition()
        } else {
          const hamburgerGroup = isMobileNav.closest('.hamburger-nav__group')

          if (!hamburgerGroup) {
            return
          }

          const clone = hamburgerGroup.cloneNode(true)

          clone.style.position = 'absolute'
          clone.style.top = '-9999px'
          clone.style.left = '-9999px'
          clone.style.visibility = 'hidden'
          clone.style.transform = 'scale(1) rotate(0.001deg)'
          clone.style.opacity = '1'
          clone.style.pointerEvents = 'none'
          clone.style.transition = 'none'

          document.body.appendChild(clone)

          clone.offsetHeight
          clone.offsetWidth

          requestAnimationFrame(() => {
            const cloneWrap = clone.querySelector('[data-anm-flip-link="wrap"]')
            const cloneLinks = cloneWrap?.querySelectorAll('[data-anm-flip-link="list"] a')

            if (!cloneWrap || !cloneLinks || cloneLinks.length === 0) {
              document.body.removeChild(clone)
              return
            }

            const cloneActiveLink =
              Array.from(cloneLinks).find(
                link => link.classList.contains('is-active') || link.classList.contains('w--current')
              ) || cloneLinks[0]
            const cloneList = cloneWrap.querySelector('[data-anm-flip-link="list"]')

            if (cloneActiveLink && cloneList) {
              const cloneLinkRect = cloneActiveLink.getBoundingClientRect()
              const cloneListRect = cloneList.getBoundingClientRect()

              gsap.set(bg, {
                width: cloneLinkRect.width,
                height: cloneLinkRect.height,
                x: cloneLinkRect.left - cloneListRect.left,
                y: cloneLinkRect.top - cloneListRect.top,
              })
            }

            document.body.removeChild(clone)
          })
        }

        if (mobileMenuWrap) {
          const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'data-navigation-status') {
                const newStatus = mobileMenuWrap.getAttribute('data-navigation-status')
                if (newStatus === 'active') {
                  const hamburgerGroup = isMobileNav.closest('.hamburger-nav__group')
                  if (hamburgerGroup) {
                    const handleTransitionEnd = e => {
                      if (e.target === hamburgerGroup && e.propertyName === 'transform') {
                        setInitialPosition()
                        hamburgerGroup.removeEventListener('transitionend', handleTransitionEnd)
                      }
                    }

                    hamburgerGroup.addEventListener('transitionend', handleTransitionEnd)

                    setTimeout(() => {
                      setInitialPosition()
                      hamburgerGroup.removeEventListener('transitionend', handleTransitionEnd)
                    }, 1000)
                  }
                }
              }
            })
          })
          observer.observe(mobileMenuWrap, { attributes: true })

          if (isPersistent) {
            if (persistentNavInstances.has(wrap)) {
              const instance = persistentNavInstances.get(wrap)
              if (instance.observer) {
                instance.observer.disconnect()
              }
              instance.observer = observer
            }
          } else {
            cleanupFunctions.push(() => observer.disconnect())
          }
        }
      } else {
        setInitialPosition()
      }

      const animateToLink = (targetLink, duration = 0.5) => {
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
