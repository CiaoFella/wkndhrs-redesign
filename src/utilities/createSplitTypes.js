import { SplitType } from '../vendor.js'

let SplitTypes = []

function init() {
  const splitTypes = document.querySelectorAll('[data-split-type]')
  if (splitTypes && splitTypes.length > 0) {
    splitTypes.forEach(splitType => {
      const type = splitType.dataset.splitType || 'lines'
      SplitTypes.push(new SplitType(splitType, { types: type }))
    })
  }
}

function cleanup() {
  SplitTypes.forEach(SplitType => {
    SplitType.revert(SplitType.elements)
  })
}

export default {
  init,
  cleanup,
}
