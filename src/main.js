import { gsap, ScrollTrigger } from './vendor.js'
import barba from './barba.js'
import menu from './animations/general/menu.js'
import mobileNavigation from './animations/general/mobileNavigation.js'
import pageLoader from './animations/general/pageLoader.js'
import { getCurrentPage, handleResponsiveElements, updateCurrentNavLink } from './utilities/helper.js'
import createSplitTexts from './utilities/createSplitTexts.js'
import { createSmoothScroll, getSmoothScroll } from './utilities/smoothScroll.js'
import handlePageEnterAnimation from './animations/general/handlePageEnter.js'
import { cursor, magneticCursor } from './utilities/customCursor/customCursor.js'
import { isDesktop } from './utilities/variables.js'
import flipLink from './animations/shared/flipLink.js'
import priority from './animations/priority.js'

gsap.registerPlugin(ScrollTrigger)
menu.init()

const mm = gsap.matchMedia()

let currentAnimationModule = null

function resetWebflow(data) {
  let parser = new DOMParser()
  let dom = parser.parseFromString(data.next.html, 'text/html')
  let webflowPageId = $(dom).find('html').attr('data-wf-page')
  $('html').attr('data-wf-page', webflowPageId)

  if (window.Webflow) {
    // Destroy existing Webflow instance
    if (typeof window.Webflow.destroy === 'function') {
      window.Webflow.destroy()
    }

    // Reinitialize Webflow
    if (typeof window.Webflow.ready === 'function') {
      window.Webflow.ready()
    }

    // Load/initialize Webflow for the new page
    if (typeof window.Webflow.load === 'function') {
      window.Webflow.load()
    }
  }
}

function cleanupCurrentModule() {
  if (currentAnimationModule && currentAnimationModule.cleanup) {
    currentAnimationModule.cleanup()
  }

  // Clean up any lingering ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())

  // Reset the current animation module reference
  currentAnimationModule = null
}

function getBaseUrl() {
  const script = document.querySelector('script[src*="main.js"]')
  const scriptSrc = script?.src || ''
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1)
  return baseUrl
}

function loadPageModule(pageName) {
  const baseUrl = getBaseUrl()
  import(/* webpackIgnore: true */ `${baseUrl}pages/${pageName}.js`)
    .then(module => {
      currentAnimationModule = module.default || {}
      if (typeof currentAnimationModule.init === 'function') {
        currentAnimationModule.init()
      } else {
        console.warn(`Module for page ${pageName} does not have an init function.`)
      }
    })
    .catch(err => {
      console.error(`Failed to load module for page: ${pageName}`, err)
      currentAnimationModule = {} // Set to an empty object to avoid further errors
    })
}

// Load the initial page module
const initialPageName = document.querySelector('[data-barba="container"]').dataset.barbaNamespace

// Initialize priority animations FIRST (navbar, etc.)
priority.init()
mobileNavigation.init() // Initialize mobile navigation as persistent (like priority)

createSplitTexts.init()
flipLink.init() // Initialize flip links (including persistent navigation)
loadPageModule(initialPageName)
pageLoader.init(initialPageName)
handleResponsiveElements()

mm.add(isDesktop, () => {
  cursor.init()
  magneticCursor()
})

document.addEventListener('onPageReady', event => {
  if (event.detail === true) {
    handlePageEnterAnimation(getCurrentPage()).play()
  }
})

barba.hooks.beforeLeave(data => {
  data.next.container.classList.add('is-animating')
  resetWebflow(data)
})

barba.hooks.leave(data => {
  priority.cleanup()
})

barba.hooks.enter(data => {
  priority.init()
})

barba.hooks.beforeEnter(data => {
  cleanupCurrentModule() // Clean up the old module first
  createSplitTexts.cleanup()
  const pageName = data.next.namespace
  createSplitTexts.init()
  updateCurrentNavLink()
  flipLink.updatePersistentNavigation() // Update persistent navigation state
  flipLink.init() // Reinitialize page-specific flip links
  loadPageModule(pageName)
})

barba.hooks.after(data => {
  handleResponsiveElements()
})
