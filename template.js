import { gsap } from '../../vendor.js'

let ctx

function init() {}

function cleanup() {
  ctx && ctx.revert()
}

export default {
  init,
  cleanup,
}
