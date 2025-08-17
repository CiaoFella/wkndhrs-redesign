let pageReady = false

const handler = {
  set: function (target, property, value) {
    if (property === 'pageReady') {
      document.dispatchEvent(new CustomEvent('onPageReady', { detail: value }))
    }
    target[property] = value
    return true
  },
}

export let proxy = new Proxy({}, handler)
Object.defineProperty(proxy, 'pageReady', {
  get: () => pageReady,
  set: newValue => {
    pageReady = newValue
    return true
  },
})
