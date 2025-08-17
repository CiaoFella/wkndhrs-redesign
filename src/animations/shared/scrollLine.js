import { gsap, ScrollTrigger } from '../../vendor.js'

let ctx

function init() {
  ctx = gsap.context(() => {
    const scrollLineSections = document.querySelectorAll('[data-anm-scroll-line=section]')

    scrollLineSections.forEach(section => {
      const topLines = section.querySelectorAll('.g_scroll_line.is-top')
      const bottomLines = section.querySelectorAll('.g_scroll_line.is-bottom')
      const leftLines = section.querySelectorAll('.g_scroll_line.is-left')
      const rightLines = section.querySelectorAll('.g_scroll_line.is-right')

      const tl = gsap.timeline({
        defaults: {
          duration: 1.5,
          ease: 'power3.inOut',
        },
      })

      gsap.set([topLines, bottomLines], {
        scaleX: 0,
      })

      gsap.set([leftLines, rightLines], {
        scaleY: 0,
      })

      const allLines = section.querySelectorAll('.g_scroll_line')

      tl.to(allLines, {
        scaleX: function (index, target) {
          return target.classList.contains('is-top') || target.classList.contains('is-bottom') ? 1 : undefined
        },
        scaleY: function (index, target) {
          return target.classList.contains('is-left') || target.classList.contains('is-right') ? 1 : undefined
        },
        transformOrigin: function (index, target) {
          if (target.classList.contains('is-top')) return 'left center'
          if (target.classList.contains('is-bottom')) return 'right center'
          if (target.classList.contains('is-left')) return 'bottom center'
          if (target.classList.contains('is-right')) return 'top center'
          return 'center center'
        },
        stagger: {
          each: 0.15,
          from: [2, 0],
          grid: [3, 4],
          axis: 'y',
        },
      })

      // ScrollTrigger to play animation when section comes into view
      ScrollTrigger.create({
        animation: tl,
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
      })
    })
  })
}

function cleanup() {
  ctx && ctx.revert()
}

export default {
  init,
  cleanup,
}
