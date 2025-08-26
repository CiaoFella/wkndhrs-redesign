import { gsap, ScrollTrigger } from '../../vendor.js'
import { getSmoothScroll } from '../../utilities/smoothScroll.js'

let ctx

function init() {
  const contentElements = [...document.querySelectorAll('[data-anm-sticky-scroll=wrap]')]
  const totalContentElements = contentElements.length

  if (contentElements.length === 0) {
    return
  }

  // Create GSAP context for cleanup
  ctx = gsap.context(() => {
    contentElements.forEach((el, position) => {
      const isLast = position === totalContentElements - 1

      if (isLast) {
        return
      }

      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=100%',
            scrub: true,
          },
        })
        .to(
          el,
          {
            ease: 'power1.out',
            startAt: { filter: 'brightness(100%)', blur: '0px' },
            rotateZ: -5,
            yPercent: 2.5,
            filter: 'brightness(80%) blur(10px)',
            scale: 0.8,
          },
          0
        )
    })

    ScrollTrigger.refresh()
  })
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
