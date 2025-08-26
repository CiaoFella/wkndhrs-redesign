import { gsap, ScrollTrigger } from '../../vendor.js'
import { getColorThemes } from '../../utilities/themeCollector.js'
import { getCurrentPage, getNextPage } from '../../utilities/helper.js'

let ctx
let scrollTriggers = []

function init() {
  // Debug Barba containers
  const allContainers = document.querySelectorAll('[data-barba="container"]')

  // Initialize theme collector if not already done
  if (!window.colorThemes) {
    getColorThemes()
  }

  // Wait for themes to be ready before setting up animations
  const setupAnimations = () => {
    if (!window.colorThemes || !window.colorThemes.themes) {
      console.warn('🎨 ScrollBg: Color themes not ready yet')
      return
    }

    // Get the correct container to search in
    const targetContainer = getTargetContainer()
    if (!targetContainer) {
      console.error('🎨 ScrollBg: No target container found!')
      return
    }

    const animateElements = targetContainer.querySelectorAll('[data-animate-to]')

    // Apply initial theme based on current scroll position
    applyInitialTheme(animateElements)

    // Dispatch event to signal that initial theme has been applied
    document.dispatchEvent(new CustomEvent('scrollBgInitialized'))

    animateElements.forEach((element, index) => {
      const themeName = element.getAttribute('data-animate-to')
      const brandName = element.getAttribute('data-animate-brand') || ''

      // Skip elements with empty or missing data-animate-to values
      if (!themeName || themeName.trim() === '') {
        console.warn(`🎨 ScrollBg: Skipping element with empty or missing data-animate-to attribute`, element)
        return
      }

      // Skip elements with empty data-animate-brand values (only if the attribute exists but is empty)
      const brandAttribute = element.getAttribute('data-animate-brand')
      if (brandAttribute !== null && brandAttribute.trim() === '') {
        console.warn(`🎨 ScrollBg: Skipping element with empty data-animate-brand attribute`, element)
        return
      }

      // Get the theme object using the new theme collector API
      const themeStyles = window.colorThemes.getTheme(themeName, brandName)

      if (!themeStyles || Object.keys(themeStyles).length === 0) {
        console.warn(`🎨 ScrollBg: Theme '${themeName}' ${brandName ? `with brand '${brandName}'` : ''} not found`)
        return
      }

      ctx = gsap.context(() => {
        const scrollTrigger = ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onToggle: ({ isActive }) => {
            if (isActive) {
              gsap.to('body', {
                ...themeStyles,
                duration: 1,
                ease: 'power2.out',
              })
            }
          },
          onRefresh: self => {
            // Check if this element should be active on page load based on current scroll position
            if (self.isActive) {
              gsap.set('body', themeStyles)
            }
          },
        })

        // Store reference to the ScrollTrigger for cleanup
        scrollTriggers.push(scrollTrigger)
      })
    })
  }

  // Check if themes are already ready
  if (window.colorThemes && window.colorThemes.themes) {
    setupAnimations()
  } else {
    // Listen for theme ready event
    document.addEventListener('colorThemesReady', setupAnimations, { once: true })
  }
}

function cleanup() {
  // Kill all ScrollTriggers first
  scrollTriggers.forEach((trigger, index) => {
    trigger.kill()
  })
  scrollTriggers = []

  // Revert GSAP context
  if (ctx) {
    ctx.revert()
  }

  // Reset body to default theme on cleanup
  resetBodyToDefault()
}

function getTargetContainer() {
  const allContainers = document.querySelectorAll('[data-barba="container"]')

  if (allContainers.length === 1) {
    // Initial load or transition complete - use the single container
    return allContainers[0]
  } else if (allContainers.length === 2) {
    // During transition - we need to target the NEW page (the one we're transitioning TO)
    // The NEW page is usually the one that's NOT leaving (doesn't have barba-leave class)

    const currentPage = getCurrentPage()
    const nextPage = getNextPage()

    // Find the container that matches the NEXT page (where we're going)
    const nextContainer = Array.from(allContainers).find(container => container.dataset.barbaNamespace === nextPage)

    if (nextContainer) {
      return nextContainer
    }

    // Fallback: use the container that's not leaving
    const nonLeavingContainer = document.querySelector('[data-barba="container"]:not(.barba-leave)')
    if (nonLeavingContainer) {
      return nonLeavingContainer
    }

    // Last fallback: use the second container (usually the new one)
    return allContainers[1]
  } else {
    // Fallback - use first container
    return allContainers[0]
  }
}

function applyInitialTheme(animateElements) {
  // Ensure ScrollTrigger calculations are fresh
  ScrollTrigger.refresh()

  // Use requestAnimationFrame to ensure DOM measurements are accurate
  requestAnimationFrame(() => {
    const currentScrollY = window.scrollY
    const viewportCenter = currentScrollY + window.innerHeight / 2

    let activeElement = null
    let lastElementTop = -1

    // Find the element that should be active based on scroll position
    Array.from(animateElements).forEach((element, index) => {
      const themeName = element.getAttribute('data-animate-to')

      // Skip elements with empty theme names
      if (!themeName || themeName.trim() === '') {
        return
      }

      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + currentScrollY
      const elementBottom = rect.bottom + currentScrollY

      const isInRange = viewportCenter >= elementTop && viewportCenter <= elementBottom

      // Check if viewport center is within this element's trigger range
      if (isInRange) {
        // If multiple elements overlap, use the one that starts last (most specific)
        if (elementTop > lastElementTop) {
          activeElement = element
          lastElementTop = elementTop
        }
      }
    })

    if (activeElement) {
      const themeName = activeElement.getAttribute('data-animate-to')
      const brandName = activeElement.getAttribute('data-animate-brand') || ''
      const themeStyles = window.colorThemes.getTheme(themeName, brandName)

      if (themeStyles && Object.keys(themeStyles).length > 0) {
        // Apply the theme immediately without animation
        gsap.set('body', themeStyles)
      } else {
        console.warn(`🎨 ScrollBg: Theme styles not found for ${themeName}`)
      }
    } else {
      // No active element, apply default theme
      resetBodyToDefault()
    }
  })
}

function resetBodyToDefault() {
  // Use the themeCollector's built-in reset method
  if (window.colorThemes && window.colorThemes.resetBodyToDefault) {
    const success = window.colorThemes.resetBodyToDefault()
    if (!success) {
      console.warn('🎨 ScrollBg: Failed to reset body to default theme')
    }
  } else if (window.colorThemes && window.colorThemes.themes) {
    // Fallback: try to get the first available theme and apply with GSAP
    const firstThemeName = Object.keys(window.colorThemes.themes)[0]

    if (firstThemeName) {
      const firstTheme = window.colorThemes.getTheme(firstThemeName)
      if (firstTheme && Object.keys(firstTheme).length > 0) {
        gsap.set('body', firstTheme)
      } else {
        console.warn('🎨 ScrollBg: Fallback theme has no styles')
      }
    } else {
      console.warn('🎨 ScrollBg: No themes available for fallback')
    }
  } else {
    console.warn('🎨 ScrollBg: No colorThemes available for reset')
  }
}

export default {
  init,
  cleanup,
}
