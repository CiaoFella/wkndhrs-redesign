import { getSmoothScroll } from '../../utilities/smoothScroll.js'
import { gsap, Flip } from '../../vendor.js'

let ctx

function init() {
  const projectListElement = document.querySelector('[data-anm-project-list="section"]')

  if (!projectListElement) {
    return
  }

  ctx = gsap.context(() => {
    // Cache DOM elements
    const list = projectListElement.querySelector('[data-anm-project-list="list"]')
    const items = [...projectListElement.querySelectorAll('[data-anm-project-list="item"]')]
    const viewToggle = projectListElement.querySelector('.project_teaser_list_view_toggle')
    const viewWrap = projectListElement.querySelector('[data-anm-project-list="view-wrap"]')
    const viewIcons = [
      ...projectListElement.querySelectorAll('[data-anm-project-list="view-icon"], [data-anm-project-list="icon"]'),
    ]
    const viewBg = projectListElement.querySelector('[data-anm-project-list="bg"]')
    const gridIcon = projectListElement.querySelector('[data-anm-type="grid"]')
    const listIcon = projectListElement.querySelector('[data-anm-type="list"]')

    if (!list || !viewToggle || !viewWrap || !viewBg || !gridIcon || !listIcon) {
      console.warn('Required elements not found for ProjectList')
      return
    }

    // State
    let currentView = 'grid'

    const listClass = 'is-list'

    // Initialize view toggle with default state
    const initializeViewToggle = () => {
      // Set initial view to grid
      currentView = 'grid'

      // Add active class to grid icon
      gridIcon.classList.add('is-active')
      listIcon.classList.remove('is-active')

      // Set initial background position
      setInitialBackgroundPosition()

      // Ensure items have correct initial state
      updateViewState('grid', false) // false = no animation on init
    }

    // Set initial position of background to match active icon
    const setInitialBackgroundPosition = () => {
      const activeIcon = gridIcon // Default to grid
      const wrapRect = viewWrap.getBoundingClientRect()
      const iconRect = activeIcon.getBoundingClientRect()

      gsap.set(viewBg, {
        width: iconRect.width,
        height: iconRect.height,
        x: iconRect.left - wrapRect.left,
        y: iconRect.top - wrapRect.top,
      })
    }

    // Animate background to target icon using Flip
    const animateBackgroundToIcon = (targetIcon, duration = 0.5) => {
      const state = Flip.getState(viewBg)

      // Get positions relative to view-wrap (direct parent of bg)
      const wrapRect = viewWrap.getBoundingClientRect()
      const targetRect = targetIcon.getBoundingClientRect()

      // Set new position
      gsap.set(viewBg, {
        width: targetRect.width,
        height: targetRect.height,
        x: targetRect.left - wrapRect.left,
        y: targetRect.top - wrapRect.top,
      })

      // Animate with Flip
      Flip.from(state, {
        duration: duration,
        ease: 'power2.inOut',
      })
    }

    // Update active states for icons
    const updateActiveStates = activeView => {
      // Remove active from all icons
      viewIcons.forEach(icon => {
        icon.classList.remove('is-active')
      })

      // Add active to current view icon
      if (activeView === 'grid') {
        gridIcon.classList.add('is-active')
      } else {
        listIcon.classList.add('is-active')
      }
    }

    // Update the view state of the list and items
    const updateViewState = (view, animate = true) => {
      if (view === 'list') {
        // Switch to list view
        if (animate) {
          // Kill any existing animations on items to prevent conflicts
          gsap.killTweensOf(items)

          // Reset items to a clean state
          gsap.set(items, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            clearProps: 'transform',
          })

          // Animate transition to list view
          const tl = gsap.timeline()

          // Fade out current state
          tl.to(items, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
              // Add is-list class to main list container
              list.classList.add(listClass)

              // Add is-list class to each item and its teaser/visual elements
              items.forEach(item => {
                item.classList.add(listClass)

                const teaser = item.querySelector('[data-anm-project-list="teaser"]')
                if (teaser) {
                  teaser.classList.add(listClass)
                }

                const visual = item.querySelector('[data-anm-project-list="visual"]')
                if (visual) {
                  visual.classList.add(listClass)
                }
              })
            },
          })

          // Fade in new state with staggered slide up animation
          tl.fromTo(
            items,
            {
              opacity: 0,
              y: 30,
              filter: 'blur(10px)',
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.1,
              filter: 'blur(0px)',
            }
          )
        } else {
          // Instant change
          list.classList.add(listClass)
          items.forEach(item => {
            item.classList.add(listClass)

            const teaser = item.querySelector('[data-anm-project-list="teaser"]')
            if (teaser) {
              teaser.classList.add(listClass)
            }

            const visual = item.querySelector('[data-anm-project-list="visual"]')
            if (visual) {
              visual.classList.add(listClass)
            }
          })
        }
      } else {
        // Switch to grid view
        if (animate) {
          // Kill any existing animations on items to prevent conflicts
          gsap.killTweensOf(items)

          // Reset items to a clean state
          gsap.set(items, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            clearProps: 'transform',
          })

          // Animate transition to grid view
          const tl = gsap.timeline()

          // Fade out current state
          tl.to(items, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
              // Remove is-list class from main list container
              list.classList.remove(listClass)

              // Remove is-list class from each item and its teaser/visual elements
              items.forEach(item => {
                item.classList.remove(listClass)

                const teaser = item.querySelector('[data-anm-project-list="teaser"]')
                if (teaser) {
                  teaser.classList.remove(listClass)
                }

                const visual = item.querySelector('[data-anm-project-list="visual"]')
                if (visual) {
                  visual.classList.remove(listClass)
                }
              })
            },
          })

          // Fade in new state with staggered slide up animation
          tl.fromTo(
            items,
            {
              opacity: 0,
              y: 30,
              filter: 'blur(10px)',
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.1,
              filter: 'blur(0px)',
            }
          )
        } else {
          // Instant change
          list.classList.remove(listClass)
          items.forEach(item => {
            item.classList.remove(listClass)

            const teaser = item.querySelector('[data-anm-project-list="teaser"]')
            if (teaser) {
              teaser.classList.remove(listClass)
            }

            const visual = item.querySelector('[data-anm-project-list="visual"]')
            if (visual) {
              visual.classList.remove(listClass)
            }
          })
        }
      }
    }

    // Switch between grid and list views
    const switchView = newView => {
      if (newView === currentView) return

      // Update current view
      currentView = newView

      // Update active states
      updateActiveStates(newView)

      // Animate background to new active icon
      const newActiveIcon = newView === 'grid' ? gridIcon : listIcon
      animateBackgroundToIcon(newActiveIcon, 0.4)

      // Update view state
      updateViewState(newView, true)

      getSmoothScroll().scrollTo(0, { duration: 1, easing: x => 1 - Math.pow(1 - x, 4) })
    }

    // Recalculate background position on resize
    const recalculateBackgroundPosition = () => {
      const activeIcon = currentView === 'grid' ? gridIcon : listIcon
      const wrapRect = viewWrap.getBoundingClientRect()
      const iconRect = activeIcon.getBoundingClientRect()

      gsap.set(viewBg, {
        width: iconRect.width,
        height: iconRect.height,
        x: iconRect.left - wrapRect.left,
        y: iconRect.top - wrapRect.top,
      })
    }

    // Setup event listeners
    const setupEventListeners = () => {
      // Handle grid icon click
      gridIcon.addEventListener('click', () => {
        if (currentView !== 'grid') {
          switchView('grid')
        }
      })

      // Handle list icon click
      listIcon.addEventListener('click', () => {
        if (currentView !== 'list') {
          switchView('list')
        }
      })

      // No hover effects - background only changes when view actually switches

      // Handle window resize
      let resizeTimeout
      const handleResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          recalculateBackgroundPosition()
        }, 250)
      }

      window.addEventListener('resize', handleResize)
    }

    // Initialize everything
    initializeViewToggle()
    setupEventListeners()

    // Reset background position after page transitions (Barba.js compatibility)
    // Listen for when page transitions complete
    if (window.barba) {
      window.barba.hooks.after(() => {
        // Small delay to ensure DOM is settled after transition
        setTimeout(() => {
          recalculateBackgroundPosition()
        }, 150)
      })
    }

    // Also listen for general page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          recalculateBackgroundPosition()
        }, 100)
      }
    })
  })
}

function cleanup() {
  if (ctx) {
    ctx.revert()
  }
}

export default {
  init,
  cleanup,
}

