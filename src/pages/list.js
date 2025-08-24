import shared from '../animations/shared.js'
import workList from '../animations/list/workList.js'

function init() {
  shared.init()
  workList.init()
}

function cleanup() {
  shared.cleanup()
  workList.cleanup()
}

export default {
  init,
  cleanup,
}
