import footer from './general/footer.js'
import navbar from './general/navbar.js'
import hero from './shared/hero.js'
import scrollText from './shared/scrollText.js'
import scrollLine from './shared/scrollLine.js'

function init() {
  hero.init()
  navbar.init()
  scrollText.init()
  scrollLine.init()
  footer.init()
}

function cleanup() {
  hero.cleanup()
  navbar.cleanup()
  scrollText.cleanup()
  scrollLine.cleanup()
  footer.cleanup()
}

export default {
  init,
  cleanup,
}
