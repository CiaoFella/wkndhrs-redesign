import { getSmoothScroll } from '../utilities/smoothScroll.js'
import navbar from './general/navbar.js'

function init() {
  navbar.init()
  navbar.showAfterTransition()
  getSmoothScroll().scrollTo(0, { immediate: true })
}

function cleanup() {
  navbar.hideForTransition()
  navbar.cleanup()
}

export default {
  init,
  cleanup,
}
