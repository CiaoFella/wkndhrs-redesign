import { gsap, ScrollTrigger } from '../vendor.js'
import { isDesktop, isLandscape, isMobile, isTablet } from './variables.js'

export function unwrapSpanAndPreserveClasses(element) {
  // Select all span elements inside the given element
  const spans = element.querySelectorAll('span')

  // Iterate over each span
  spans.forEach(span => {
    // Get the class list of the span
    const spanClasses = span.className

    // Create a document fragment to hold the new elements
    const fragment = document.createDocumentFragment()

    // Iterate over child nodes to preserve <br> elements
    span.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split the text content into words
        const words = node.textContent.split(/\s+/)

        words.forEach((word, index) => {
          // Create a new span for each word
          const newSpan = document.createElement('span')
          newSpan.textContent = word

          // Add the original span's classes to the new span
          if (spanClasses) {
            newSpan.className = spanClasses
          }

          // Append the new span and a space after the word (if it's not the last word)
          fragment.appendChild(newSpan)
          if (index < words.length - 1) {
            fragment.appendChild(document.createTextNode(' '))
          }
        })
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        // Preserve <br> elements
        fragment.appendChild(node.cloneNode())
      }
    })

    // Replace the original span with the new fragment
    span.replaceWith(fragment)
  })
}

export function closeMenu() {
  const menuTrigger = document.querySelector('[data-menu-mobile=trigger]')

  if (menuTrigger.classList.contains('is-active')) {
    menuTrigger.click()
  }
}

export function getCurrentPage() {
  const currentPage = document.querySelector('[data-barba="container"]').dataset.barbaNamespace

  return currentPage
}

let mm

export function handleResponsiveElements() {
  if (mm) {
    mm.revert()
  }

  mm = gsap.matchMedia()

  const removedElementsMap = new Map()

  mm.add(isTablet, () => {
    handleElementRemoval('tablet')
  })

  mm.add(isLandscape, () => {
    handleElementRemoval('landscape')
  })

  mm.add(isMobile, () => {
    handleElementRemoval('mobile')
  })

  mm.add(isDesktop, () => {
    return () => {}
  })

  function handleElementRemoval(breakpoint) {
    document.querySelectorAll('[data-remove]').forEach(el => {
      const removeAt = el.getAttribute('data-remove') // e.g., "tablet", "landscape", "mobile"
      const parent = el.parentNode
      const nextSibling = el.nextElementSibling

      if (removeAt === breakpoint) {
        if (!removedElementsMap.has(el)) {
          removedElementsMap.set(el, { parent, nextSibling })
          parent.removeChild(el)
        }
      }
    })
  }
}

export function updateCurrentNavLink() {
  const currentPath = window.location.pathname

  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href')

    if (href === currentPath || href === currentPath + '/') {
      link.classList.add('w--current') // Webflow uses 'w--current' for the 'current' class
    } else {
      link.classList.remove('w--current')
    }
  })
}
