import { gsap, ScrollTrigger } from '../../vendor.js'
import { getColorThemes } from '../../utilities/themeCollector.js'
import { getCurrentPage, getNextPage } from '../../utilities/helper.js'

let ctx
let scrollTriggers = []

function init() {
  console.log('🎨 ScrollBg: Starting initialization')

  // Debug Barba containers
  const allContainers = document.querySelectorAll('[data-barba="container"]')
  console.log('🎨 ScrollBg: Found containers:', allContainers.length)
  allContainers.forEach((container, index) => {
    console.log(`🎨 Container ${index + 1}:`, {
      namespace: container.dataset.barbaNamespace,
      classes: container.className,
      isAnimating: container.classList.contains('is-animating'),
      isLeaving: container.classList.contains('barba-leave'),
    })
  })

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

    console.log('🎨 ScrollBg: Setting up animations')
    console.log('🎨 ScrollBg: Current page:', getCurrentPage())
    console.log('🎨 ScrollBg: Next page:', getNextPage())

    // Get the correct container to search in
    const targetContainer = getTargetContainer()
    if (!targetContainer) {
      console.error('🎨 ScrollBg: No target container found!')
      return
    }

    console.log('🎨 ScrollBg: Using container:', {
      namespace: targetContainer.dataset.barbaNamespace,
      classes: targetContainer.className,
    })

    const animateElements = targetContainer.querySelectorAll('[data-animate-to]')
    console.log('🎨 ScrollBg: Found animate elements:', animateElements.length)

    // Debug each element
    animateElements.forEach((element, index) => {
      const themeName = element.getAttribute('data-animate-to')
      const brandName = element.getAttribute('data-animate-brand')
      console.log(`🎨 Element ${index + 1}:`, {
        theme: themeName,
        brand: brandName,
        tagName: element.tagName,
        classes: element.className,
      })
    })

    console.log('🎨 ScrollBg: Available themes:', Object.keys(window.colorThemes.themes))

    // Apply initial theme based on current scroll position
    applyInitialTheme(animateElements)

    // Dispatch event to signal that initial theme has been applied
    document.dispatchEvent(new CustomEvent('scrollBgInitialized'))

    animateElements.forEach((element, index) => {
      const themeName = element.getAttribute('data-animate-to')
      const brandName = element.getAttribute('data-animate-brand') || ''

      console.log(`🎨 ScrollBg: Processing element ${index + 1}/${animateElements.length}`, {
        theme: themeName,
        brand: brandName,
      })

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

      console.log(`🎨 ScrollBg: Creating ScrollTrigger for '${themeName}'${brandName ? ` (${brandName})` : ''}`)

      ctx = gsap.context(() => {
        const scrollTrigger = ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onToggle: ({ isActive }) => {
            console.log(`🎨 ScrollBg: Toggle '${themeName}' - Active: ${isActive}`)
            if (isActive) {
              console.log(`🎨 ScrollBg: Applying theme '${themeName}' with animation`)
              gsap.to('body', {
                ...themeStyles,
                duration: 1,
                ease: 'power2.out',
              })
            }
          },
          onRefresh: self => {
            console.log(`🎨 ScrollBg: Refresh '${themeName}' - Active: ${self.isActive}`)
            // Check if this element should be active on page load based on current scroll position
            if (self.isActive) {
              console.log(`🎨 ScrollBg: Setting initial theme '${themeName}' without animation`)
              gsap.set('body', themeStyles)
            }
          },
          markers: true,
        })

        // Store reference to the ScrollTrigger for cleanup
        scrollTriggers.push(scrollTrigger)
        console.log(`🎨 ScrollBg: ScrollTrigger created. Total: ${scrollTriggers.length}`)
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
  console.log('🎨 ScrollBg: Starting cleanup')
  console.log('🎨 ScrollBg: ScrollTriggers to clean:', scrollTriggers.length)

  // Kill all ScrollTriggers first
  scrollTriggers.forEach((trigger, index) => {
    console.log(`🎨 ScrollBg: Killing ScrollTrigger ${index + 1}`)
    trigger.kill()
  })
  scrollTriggers = []

  // Revert GSAP context
  if (ctx) {
    console.log('🎨 ScrollBg: Reverting GSAP context')
    ctx.revert()
  }

  // Reset body to default theme on cleanup
  console.log('🎨 ScrollBg: Resetting body to default theme')
  resetBodyToDefault()

  console.log('🎨 ScrollBg: Cleanup complete')
}

function getTargetContainer() {
  const allContainers = document.querySelectorAll('[data-barba="container"]')

  if (allContainers.length === 1) {
    // Initial load or transition complete - use the single container
    console.log('🎨 ScrollBg: Single container found, using it')
    return allContainers[0]
  } else if (allContainers.length === 2) {
    // During transition - we need to target the NEW page (the one we're transitioning TO)
    // The NEW page is usually the one that's NOT leaving (doesn't have barba-leave class)

    const currentPage = getCurrentPage()
    const nextPage = getNextPage()

    console.log('🎨 ScrollBg: Transition detected:', {
      current: currentPage,
      next: nextPage,
    })

    // Find the container that matches the NEXT page (where we're going)
    const nextContainer = Array.from(allContainers).find(container => container.dataset.barbaNamespace === nextPage)

    if (nextContainer) {
      console.log('🎨 ScrollBg: Using next page container:', nextPage)
      return nextContainer
    }

    // Fallback: use the container that's not leaving
    const nonLeavingContainer = document.querySelector('[data-barba="container"]:not(.barba-leave)')
    if (nonLeavingContainer) {
      console.log('🎨 ScrollBg: Using non-leaving container as fallback')
      return nonLeavingContainer
    }

    // Last fallback: use the second container (usually the new one)
    console.log('🎨 ScrollBg: Using second container as final fallback')
    return allContainers[1]
  } else {
    // Fallback - use first container
    console.log('🎨 ScrollBg: Multiple containers, using first as fallback')
    return allContainers[0]
  }
}

function applyInitialTheme(animateElements) {
  console.log('🎨 ScrollBg: Applying initial theme')
  console.log('🎨 ScrollBg: Elements to check:', animateElements.length)
  console.log('🎨 ScrollBg: Current scroll position:', window.scrollY)

  // Ensure ScrollTrigger calculations are fresh
  ScrollTrigger.refresh()

  // Use requestAnimationFrame to ensure DOM measurements are accurate
  requestAnimationFrame(() => {
    const currentScrollY = window.scrollY
    const viewportCenter = currentScrollY + window.innerHeight / 2

    console.log('🎨 ScrollBg: Viewport center:', viewportCenter)

    let activeElement = null
    let lastElementTop = -1

    // Find the element that should be active based on scroll position
    Array.from(animateElements).forEach((element, index) => {
      const themeName = element.getAttribute('data-animate-to')

      // Skip elements with empty theme names
      if (!themeName || themeName.trim() === '') {
        console.log(`🎨 Element ${index + 1} (empty theme): Skipping`)
        return
      }

      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + currentScrollY
      const elementBottom = rect.bottom + currentScrollY

      const isInRange = viewportCenter >= elementTop && viewportCenter <= elementBottom

      console.log(`🎨 Element ${index + 1} (${themeName}):`, {
        top: elementTop,
        bottom: elementBottom,
        center: viewportCenter,
        inRange: isInRange,
        height: elementBottom - elementTop,
      })

      // Check if viewport center is within this element's trigger range
      if (isInRange) {
        // If multiple elements overlap, use the one that starts last (most specific)
        if (elementTop > lastElementTop) {
          activeElement = element
          lastElementTop = elementTop
          console.log(`🎨 ScrollBg: New active element: ${themeName}`)
        }
      }
    })

    if (activeElement) {
      const themeName = activeElement.getAttribute('data-animate-to')
      const brandName = activeElement.getAttribute('data-animate-brand') || ''
      const themeStyles = window.colorThemes.getTheme(themeName, brandName)

      console.log(`🎨 ScrollBg: Active element found: ${themeName}${brandName ? ` (${brandName})` : ''}`)

      if (themeStyles && Object.keys(themeStyles).length > 0) {
        // Apply the theme immediately without animation
        gsap.set('body', themeStyles)
        console.log(`🎨 ScrollBg: Applied initial theme: ${themeName}${brandName ? ` (${brandName})` : ''}`)
      } else {
        console.warn(`🎨 ScrollBg: Theme styles not found for ${themeName}`)
      }
    } else {
      // No active element, apply default theme
      console.log('🎨 ScrollBg: No active element, applying default theme')
      resetBodyToDefault()
    }
  })
}

function resetBodyToDefault() {
  console.log('🎨 ScrollBg: Resetting body to default theme')

  // Use the themeCollector's built-in reset method
  if (window.colorThemes && window.colorThemes.resetBodyToDefault) {
    const success = window.colorThemes.resetBodyToDefault()
    if (success) {
      console.log('🎨 ScrollBg: Successfully reset to default theme')
    } else {
      console.warn('🎨 ScrollBg: Failed to reset body to default theme')
    }
  } else if (window.colorThemes && window.colorThemes.themes) {
    // Fallback: try to get the first available theme and apply with GSAP
    const firstThemeName = Object.keys(window.colorThemes.themes)[0]
    console.log('🎨 ScrollBg: Using fallback theme:', firstThemeName)

    if (firstThemeName) {
      const firstTheme = window.colorThemes.getTheme(firstThemeName)
      if (firstTheme && Object.keys(firstTheme).length > 0) {
        gsap.set('body', firstTheme)
        console.log('🎨 ScrollBg: Applied fallback theme:', firstThemeName)
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
