import footer from './general/footer.js'
import navbar from './general/navbar.js'
import hero from './shared/hero.js'
import scrollText from './shared/scrollText.js'

function init() {
  hero.init()
  navbar.init()
  scrollText.init()
  footer.init()
}

function cleanup() {
  hero.cleanup()
  navbar.cleanup()
  scrollText.cleanup()
  footer.cleanup()
}

export default {
  init,
  cleanup,
}
