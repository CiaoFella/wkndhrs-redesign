/**
 * Theme Collector 1.1.1
 * Released under the MIT License
 * Released on: January 17, 2025
 */

const STORAGE_KEYS = {
  THEMES: 'colorThemes_data',
  PUBLISH_DATE: 'colorThemes_publishDate',
}

function getPublishDate() {
  const htmlComment = document.documentElement.previousSibling
  return htmlComment?.nodeType === Node.COMMENT_NODE
    ? new Date(htmlComment.textContent.match(/Last Published: (.+?) GMT/)[1]).getTime()
    : null
}

function loadFromStorage() {
  try {
    const storedPublishDate = localStorage.getItem(STORAGE_KEYS.PUBLISH_DATE)
    const currentPublishDate = getPublishDate()
    if (!currentPublishDate || !storedPublishDate || storedPublishDate !== currentPublishDate.toString()) return null
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.THEMES))
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return null
  }
}

function saveToStorage(themes) {
  try {
    const publishDate = getPublishDate()
    if (publishDate) {
      localStorage.setItem(STORAGE_KEYS.PUBLISH_DATE, publishDate.toString())
      localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes))
    }
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export function getColorThemes() {
  window.colorThemes = {
    themes: {},
    defaultTheme: 'light',
    getTheme(themeName = '', brandName = '') {
      if (!themeName) return this.getTheme(Object.keys(this.themes)[0], brandName)
      const theme = this.themes[themeName]
      if (!theme) return {}
      if (!theme.brands || Object.keys(theme.brands).length === 0) return theme
      if (!brandName) return theme.brands[Object.keys(theme.brands)[0]]
      return theme.brands[brandName] || {}
    },
    getDefaultTheme(brandName = '') {
      return this.getTheme(this.defaultTheme, brandName)
    },
    resetBodyToDefault(brandName = '') {
      // First, clear all existing theme properties
      this.clearAllThemeProperties()

      const defaultTheme = this.getDefaultTheme(brandName)
      if (defaultTheme && Object.keys(defaultTheme).length > 0) {
        // Apply CSS custom properties to body
        Object.entries(defaultTheme).forEach(([property, value]) => {
          document.body.style.setProperty(property, value)
        })
        return true
      }
      return false
    },
    clearAllThemeProperties() {
      // Get all theme properties from all available themes
      const allProperties = new Set()

      Object.values(this.themes).forEach(theme => {
        if (theme.brands && Object.keys(theme.brands).length > 0) {
          // Theme has brands
          Object.values(theme.brands).forEach(brandTheme => {
            Object.keys(brandTheme).forEach(prop => allProperties.add(prop))
          })
        } else {
          // Theme without brands
          Object.keys(theme).forEach(prop => allProperties.add(prop))
        }
      })

      // Remove all theme properties from body
      allProperties.forEach(property => {
        document.body.style.removeProperty(property)
      })
    },
  }

  const cachedThemes = loadFromStorage()
  if (cachedThemes) {
    window.colorThemes.themes = cachedThemes
    document.dispatchEvent(new CustomEvent('colorThemesReady'))
    return
  }

  const firstLink = document.querySelector('link[rel="stylesheet"]')
  if (!firstLink?.href) return null

  const themeVariables = new Set()
  const themeClasses = new Set()
  const brandClasses = new Set()

  fetch(firstLink.href)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch stylesheet: ${response.statusText}`)
      return response.text()
    })
    .then(cssText => {
      // Find theme variables
      ;(cssText.match(/--_theme[\w-]+:\s*[^;]+/g) || []).forEach(variable =>
        themeVariables.add(variable.split(':')[0].trim())
      )

      // Find theme and brand classes
      ;(cssText.match(/\.u-(theme|brand)-[\w-]+/g) || []).forEach(className => {
        if (className.startsWith('.u-theme-')) themeClasses.add(className)
        if (className.startsWith('.u-brand-')) brandClasses.add(className)
      })

      const themeVariablesArray = Array.from(themeVariables)

      function checkClass(themeClass, brandClass = null) {
        let documentClasses = document.documentElement.getAttribute('class')
        document.documentElement.setAttribute('class', '')
        document.documentElement.classList.add(themeClass, brandClass)
        const styleObject = {}
        themeVariablesArray.forEach(
          variable => (styleObject[variable] = getComputedStyle(document.documentElement).getPropertyValue(variable))
        )
        document.documentElement.setAttribute('class', documentClasses)
        return styleObject
      }

      themeClasses.forEach(themeClassWithDot => {
        const themeName = themeClassWithDot.replace('.', '').replace('u-theme-', '')
        window.colorThemes.themes[themeName] = { brands: {} }

        brandClasses.forEach(brandClassWithDot => {
          const brandName = brandClassWithDot.replace('.', '').replace('u-brand-', '')
          window.colorThemes.themes[themeName].brands[brandName] = checkClass(
            themeClassWithDot.replace('.', ''),
            brandClassWithDot.replace('.', '')
          )
        })

        if (!brandClasses.size) window.colorThemes.themes[themeName] = checkClass(themeClassWithDot.replace('.', ''))
      })

      saveToStorage(window.colorThemes.themes)
      document.dispatchEvent(new CustomEvent('colorThemesReady'))
    })
    .catch(error => console.error('Error:', error.message))
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', getColorThemes)
} else {
  getColorThemes()
}
