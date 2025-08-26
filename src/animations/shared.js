import footer from './general/footer.js'
import hero from './shared/hero.js'
import scrollText from './shared/scrollText.js'
import logoGrid from './shared/logoGrid.js'
import scrollBg from './shared/scrollBg.js'
import stickyScroll from './shared/stickyScroll.js'
import rollerNumber from './shared/rollerNumber.js'

function init() {
  hero.init()
  scrollText.init()
  logoGrid.init()
  scrollBg.init()
  stickyScroll.init()
  rollerNumber.init()
  footer.init()
}

function cleanup() {
  hero.cleanup()
  scrollText.cleanup()
  logoGrid.cleanup()
  scrollBg.cleanup()
  stickyScroll.cleanup()
  rollerNumber.cleanup()
  footer.cleanup()
}

export default {
  init,
  cleanup,
}
