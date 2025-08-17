import { gsap } from '../../vendor.js'

export default class Magnetic {
  constructor(el, options = {}) {
    this.el = document.querySelector(el)
    this.options = Object.assign(
      {
        y: 0.2,
        x: 0.2,
        s: 0.2,
        rs: 0.7,
      },
      options
    )

    this.y = 0
    this.x = 0
    this.width = 0
    this.height = 0

    if (this.el.getAttribute('data-magnetic-init')) return
    this.el.setAttribute('data-magnetic-init', 'true')

    this.bind()
  }

  bind() {
    this.el.addEventListener('mouseenter', () => {
      const rect = this.el.getBoundingClientRect()
      this.y = rect.top + window.pageYOffset
      this.x = rect.left + window.pageXOffset
      this.width = rect.width
      this.height = rect.height
    })

    this.el.addEventListener('mousemove', e => {
      const y = (e.clientY - this.y - this.height / 2) * this.options.y
      const x = (e.clientX - this.x - this.width / 2) * this.options.x

      this.move(x, y, this.options.s, 'power1.out')
    })

    this.el.addEventListener('mouseleave', () => {
      this.move(0, 0, this.options.rs, 'elastic.out(1.5,0.75)')
    })
  }

  move(x, y, speed, ease) {
    gsap.to(this.el, {
      y: y,
      x: x,
      force3D: true,
      overwrite: true,
      duration: speed,
      ease: ease,
    })
  }
}
