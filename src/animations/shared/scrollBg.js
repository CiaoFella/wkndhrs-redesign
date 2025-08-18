import { gsap, ScrollTrigger } from '../../vendor.js'
import { getColorThemes } from '../../utilities/themeCollector.js'

let ctx

function init() {
  // Initialize theme collector if not already done
  if (!window.colorThemes) {
    getColorThemes()
  }

  // Wait for themes to be ready before setting up animations
  const setupAnimations = () => {
    if (!window.colorThemes || !window.colorThemes.themes) {
      console.warn('Color themes not ready yet')
      return
    }

    const animateElements = document.querySelectorAll('[data-animate-to]')
    console.log('Animate elements:', animateElements)
    console.log('Available themes:', window.colorThemes.themes)

    animateElements.forEach(element => {
      const themeName = element.getAttribute('data-animate-to')
      const brandName = element.getAttribute('data-animate-brand') || ''

      // Get the theme object using the new theme collector API
      const themeStyles = window.colorThemes.getTheme(themeName, brandName)

      if (!themeStyles || Object.keys(themeStyles).length === 0) {
        console.warn(`Theme '${themeName}' ${brandName ? `with brand '${brandName}'` : ''} not found`)
        return
      }

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: element,
          start: 'top 25%',
          end: 'bottom 25%',
          onToggle: ({ isActive }) => {
            if (isActive) {
              gsap.to('body', {
                ...themeStyles,
                duration: 1,
                ease: 'power2.out',
              })
            }
          },
          markers: true,
        })
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
  ctx && ctx.revert()
}

export default {
  init,
  cleanup,
}
