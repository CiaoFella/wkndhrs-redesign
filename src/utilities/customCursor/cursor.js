import { gsap } from '../../vendor.js'

const pointerCollection = 'a,input,textarea,button,.menu-trigger'

export default class Cursor {
  constructor(options) {
    this.options = Object.assign(
      {
        container: 'body',
        speed: 0.7,
        ease: 'expo.out',
        visibleTimeout: 300,
      },
      options
    )
    this.body = document.querySelector(this.options.container)
    this.el = document.createElement('div')
    this.el.className = 'cb-cursor'
    this.text = document.createElement('div')
    this.text.className = 'cb-cursor-text'
    this.init()
  }

  init() {
    this.el.appendChild(this.text)
    this.body.appendChild(this.el)
    this.bind()
    this.move(-window.innerWidth, -window.innerHeight, 0)
  }

  bind() {
    const self = this

    this.body.addEventListener('mouseleave', () => {
      self.hide()
    })

    this.body.addEventListener('mouseenter', () => {
      self.show()
    })

    this.body.addEventListener('mousemove', e => {
      this.pos = {
        x: this.stick ? this.stick.x - (this.stick.x - e.clientX) * 0.15 : e.clientX,
        y: this.stick ? this.stick.y - (this.stick.y - e.clientY) * 0.15 : e.clientY,
      }
      this.update()
    })

    this.body.addEventListener('mousedown', () => {
      self.setState('-active')
    })

    this.body.addEventListener('mouseup', () => {
      self.removeState('-active')
    })

    this.body.querySelectorAll(pointerCollection).forEach(el => {
      el.addEventListener('mouseenter', () => {
        self.setState('-pointer')
      })
      el.addEventListener('mouseleave', () => {
        self.removeState('-pointer')
      })
    })

    this.body.querySelectorAll('iframe').forEach(el => {
      el.addEventListener('mouseenter', () => {
        self.hide()
      })
      el.addEventListener('mouseleave', () => {
        self.show()
      })
    })

    this.body.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', function () {
        self.setState(this.dataset.cursor)
      })
      el.addEventListener('mouseleave', function () {
        self.removeState(this.dataset.cursor)
      })
    })

    this.body.querySelectorAll('[data-cursor-text]').forEach(el => {
      el.addEventListener('mouseenter', function () {
        self.setText(this.dataset.cursorText)
      })
      el.addEventListener('mouseleave', function () {
        self.removeText()
      })
    })

    this.body.querySelectorAll('[data-cursor-stick]').forEach(el => {
      el.addEventListener('mouseenter', function () {
        self.setStick(this.dataset.cursorStick)
      })
      el.addEventListener('mouseleave', function () {
        self.removeStick()
      })
    })
  }

  setState(state) {
    this.el.classList.add(state)
  }

  removeState(state) {
    this.el.classList.remove(state)
  }

  toggleState(state) {
    this.el.classList.toggle(state)
  }

  setText(text) {
    this.text.innerHTML = text
    this.el.classList.add('-text')
  }

  removeText() {
    this.el.classList.remove('-text')
  }

  setStick(el) {
    const target = document.querySelector(el)
    const bound = target.getBoundingClientRect()
    this.stick = {
      y: bound.top + target.offsetHeight / 2,
      x: bound.left + target.offsetWidth / 2,
    }
    this.move(this.stick.x, this.stick.y, 5)
  }

  removeStick() {
    this.stick = false
  }

  update() {
    this.move()
    this.show()
  }

  move(x, y, duration) {
    gsap.to(this.el, {
      x: x || this.pos.x,
      y: y || this.pos.y,
      force3D: true,
      overwrite: true,
      ease: this.options.ease,
      duration: this.visible ? duration || this.options.speed : 0,
    })
  }

  show() {
    if (this.visible) return
    clearTimeout(this.visibleInt)
    this.el.classList.add('-visible')
    this.visibleInt = setTimeout(() => (this.visible = true), 0)
  }

  hide() {
    clearTimeout(this.visibleInt)
    this.el.classList.remove('-visible')
    this.visibleInt = setTimeout(() => (this.visible = false), this.options.visibleTimeout)
  }
}
