import { gsap, ScrollTrigger } from '../../vendor.js'

let ctx

function init() {
  const section = document.querySelector('[data-scroll-parallax=section]')

  if (section) {
    const wraps = section.querySelectorAll('[data-scroll-parallax=wrap]')
    ctx = gsap.context(() => {
      if (wraps && wraps.length > 0) {
        wraps.forEach(item => {
          const parallax = item.querySelectorAll('[data-scroll-parallax=parallax]')

          const scrollTl = gsap.timeline()

          ScrollTrigger.create({
            animation: scrollTl,
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.25,
          })

          scrollTl.fromTo(
            parallax,
            {
              yPercent: -10,
            },
            {
              yPercent: 10,
              duration: 1,
            }
          )
        }, '<')
      }
    })
  }
}

function cleanup() {
  if (ctx) {
    ctx.revert()
  }
}

export default {
  init,
  cleanup,
}
