import shared from '../animations/shared.js'
import priority from '../animations/priority.js'

function init() {
  shared.init()

  // Initialize priority animations after shared animations
  // Listen for scrollBg initialization completion
  document.addEventListener(
    'scrollBgInitialized',
    () => {
      priority.init()
    },
    { once: true }
  )
}

function cleanup() {
  shared.cleanup()
}

export default {
  init,
  cleanup,
}
