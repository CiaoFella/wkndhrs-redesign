import footer from './general/footer.js'
import hero from './shared/hero.js'

function init() {
  hero.init()
  footer.init()
}

function cleanup() {
  hero.cleanup()
  footer.cleanup()
}

export default {
  init,
  cleanup,
}
