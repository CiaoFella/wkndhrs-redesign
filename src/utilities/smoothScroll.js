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

export function createSmoothScroll(options = {}) {
  if (locomotiveScroll) {
    locomotiveScroll.destroy()
  }
  locomotiveScroll = new LocomotiveScroll({
    lerp,
    wheelMultiplier,
    touchMultiplier,
    ...options,
  })

  return locomotiveScroll
}

export function getSmoothScroll() {
  return locomotiveScroll
}

// Create initial locomotiveScroll
locomotiveScroll = createSmoothScroll()

export default locomotiveScroll
