import { LocomotiveScroll, gsap } from '../vendor.js'
import { isDesktop, isTablet } from './variables.js'

const mm = gsap.matchMedia()

let lerp
let wheelMultiplier
let touchMultiplier

mm.add(isTablet, () => {
  lerp = 0.975
  wheelMultiplier = 0
  touchMultiplier = 0
})

mm.add(isDesktop, () => {
  lerp = 0.2
  wheelMultiplier = 0.7
  touchMultiplier = 0
})

let locomotiveScroll = null
let scrollData = {
  scroll: 0,
  limit: 0,
  velocity: 0,
  direction: 0,
  progress: 0,
}

// Scroll callback function to track scroll data
function onScroll({ scroll, limit, velocity, direction, progress }) {
  scrollData = { scroll, limit, velocity, direction, progress }
}

export function createSmoothScroll(options = {}) {
  if (locomotiveScroll) {
    locomotiveScroll.destroy()
  }
  locomotiveScroll = new LocomotiveScroll({
    lerp,
    wheelMultiplier,
    touchMultiplier,
    scrollCallback: onScroll,
    ...options,
  })

  return locomotiveScroll
}

export function getSmoothScroll() {
  return locomotiveScroll
}

export function getScrollData() {
  return scrollData
}

// Create initial locomotiveScroll
locomotiveScroll = createSmoothScroll()

export default locomotiveScroll
