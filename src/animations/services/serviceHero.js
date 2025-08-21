import { gsap, ScrollTrigger } from '../../vendor.js'

gsap.registerPlugin(ScrollTrigger)

let ctx
let serviceNames = []
let totalItems = 0
let currentActiveIndex = 0
let lastDirection = 0
let lastProgress = 0
let initialYPosition = 0

function init() {
  const section = document.querySelector('[data-anm-service-hero="section"]')

  if (!section) return

  ctx = gsap.context(() => {
    const scrollContainer = section.querySelector('[data-anm-service-hero="scroll"]')
    const roller = section.querySelector('[data-anm-service-hero="roller"]')
    const trigger = section.querySelector('[data-anm-service-hero="name-trigger"]')
    const names = roller.querySelectorAll('[data-anm-service-hero="name"]')

    if (!scrollContainer || !roller || !trigger || names.length === 0) return

    const originalNames = Array.from(names)
    totalItems = originalNames.length

    // Find which item has "is-active" class initially
    const initialActiveIndex = originalNames.findIndex(name => name.classList.contains('is-active'))
    const activeIndex = initialActiveIndex !== -1 ? initialActiveIndex : 4 // fallback

    // Create infinite loop structure: [clones] + [originals] + [clones]
    createInfiniteLoop(roller, originalNames)

    // Update serviceNames to include all items (clones + originals + clones)
    serviceNames = Array.from(roller.querySelectorAll('[data-anm-service-hero="name"]'))

    // Position roller so the original active item is in the center
    // The original items start at index totalItems, so active item is at totalItems + activeIndex
    const targetActiveIndex = totalItems + activeIndex
    const centerOffset = Math.floor(serviceNames.length / 2)
    const offsetToCenter = targetActiveIndex - centerOffset
    initialYPosition = -offsetToCenter
    gsap.set(roller, { y: `${initialYPosition}em` })

    // Set current active index to the center position
    currentActiveIndex = centerOffset

    // Set up scroll-based animation
    setupScrollAnimation(scrollContainer, roller, trigger)

    // Initialize active state
    updateActiveState(currentActiveIndex)
  }, section)
}

function createInfiniteLoop(roller, originalNames) {
  // Clone all original names for the beginning (top clones)
  const topClones = originalNames.map(name => {
    const clone = name.cloneNode(true)
    clone.classList.remove('is-active')
    return clone
  })

  // Clone all original names for the end (bottom clones)
  const bottomClones = originalNames.map(name => {
    const clone = name.cloneNode(true)
    clone.classList.remove('is-active')
    return clone
  })

  // Insert top clones at the beginning
  topClones.reverse().forEach(clone => {
    roller.insertBefore(clone, roller.firstChild)
  })

  // Append bottom clones at the end
  bottomClones.forEach(clone => {
    roller.appendChild(clone)
  })
}

function setupScrollAnimation(scrollContainer, roller, trigger) {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0,
    onUpdate: self => {
      const progress = self.progress
      const direction = self.direction

      // Calculate scroll distance - move exactly totalItems * 1em across full scroll
      const maxScrollDistance = totalItems // Move totalItems * 1em total
      const scrollDistance = progress * maxScrollDistance

      // Move the roller: initial position + scroll distance (negative for scrolling down)
      const targetY = initialYPosition - scrollDistance
      gsap.set(roller, { y: `${targetY}em` })

      // Track direction changes
      if (direction !== lastDirection) {
        lastDirection = direction
      }

      // Check which name should be active based on trigger position and direction
      checkActiveItem(roller, trigger, direction)

      lastProgress = progress
    },
  })
}

function checkActiveItem(roller, trigger, direction) {
  const triggerRect = trigger.getBoundingClientRect()
  const triggerCenter = triggerRect.top + triggerRect.height / 2

  // Get all current name elements
  const currentNames = roller.querySelectorAll('[data-anm-service-hero="name"]')

  let newActiveIndex = -1

  currentNames.forEach((name, index) => {
    const nameRect = name.getBoundingClientRect()
    const nameTop = nameRect.top
    const nameBottom = nameRect.bottom

    if (direction > 0) {
      // Scrolling down - check if top of name hits center of trigger
      if (Math.abs(nameTop - triggerCenter) < 5) {
        // 5px tolerance
        newActiveIndex = index
      }
    } else {
      // Scrolling up - check if bottom of name hits center of trigger
      if (Math.abs(nameBottom - triggerCenter) < 5) {
        // 5px tolerance
        newActiveIndex = index
      }
    }
  })

  // If we found a new active item and it's different from current
  if (newActiveIndex !== -1 && newActiveIndex !== currentActiveIndex) {
    currentActiveIndex = newActiveIndex
    updateActiveState(currentActiveIndex)
  }
}

function updateActiveState(activeIndex) {
  // Remove active class from all items
  serviceNames.forEach(name => {
    name.classList.remove('is-active')
  })

  // Add active class to the current item
  if (serviceNames[activeIndex]) {
    serviceNames[activeIndex].classList.add('is-active')
  }
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
