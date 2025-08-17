import { SplitText } from '../vendor.js'

let SplitTexts = []

function init() {
  const splitTexts = document.querySelectorAll('[data-split-type]')
  if (splitTexts && splitTexts.length > 0) {
    splitTexts.forEach(splitText => {
      const type = splitText.dataset.splitText || 'lines'
      SplitTexts.push(SplitText.create(splitText, { types: type }))
    })
  }
}

function cleanup() {
  SplitTexts.forEach(splitText => {
    splitText.revert(splitText.elements)
  })
}

export default {
  init,
  cleanup,
}
