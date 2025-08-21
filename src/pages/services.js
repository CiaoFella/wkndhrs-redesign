import shared from '../animations/shared.js'
import serviceHero from '../animations/services/serviceHero.js'

function init() {
  shared.init()
  serviceHero.init()
}

function cleanup() {
  shared.cleanup()
  serviceHero.cleanup()
}

export default {
  init,
  cleanup,
}
