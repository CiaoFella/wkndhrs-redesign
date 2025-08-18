import footer from './general/footer.js'
import navbar from './general/navbar.js'
import hero from './shared/hero.js'
import scrollText from './shared/scrollText.js'
import scrollLine from './shared/scrollLine.js'
import scrollBg from './shared/scrollBg.js'
import stickyScroll from './shared/stickyScroll.js'

function init() {
  hero.init()
  navbar.init()
  scrollText.init()
  scrollLine.init()
  scrollBg.init()
  stickyScroll.init()
  footer.init()
}

function cleanup() {
  hero.cleanup()
  navbar.cleanup()
  scrollText.cleanup()
  scrollLine.cleanup()
  scrollBg.cleanup()
  stickyScroll.cleanup()
  footer.cleanup()
}

export default {
  init,
  cleanup,
}
