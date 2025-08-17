import { fullClipPath, topClipPath } from '../../utilities/variables.js'
import { gsap, ScrollTrigger, SplitType } from '../../vendor.js'

let ctx

function init() {
  const section = document.querySelector('[data-footer=section]')

  if (section) {
    const target = section.querySelector('[data-footer=scroll-target]')
    const button = section.querySelector('[data-button=footer]')
    const elements = section.querySelectorAll('[data-footer=element]')
    const paragraph = section.querySelector('[data-footer=paragraph]')

    const paragraphSplit = new SplitType(paragraph, { types: 'lines' })

    ctx = gsap.context(() => {
      const scrubTl = gsap.timeline()
      const enterTl = gsap.timeline({ defaults: { duration: 1, ease: 'expo.out' } })

      ScrollTrigger.create({
        trigger: section,
        animation: scrubTl,
        start: 'top bottom',
        end: 'center center',
        scrub: true,
      })

      ScrollTrigger.create({
        trigger: section,
        animation: enterTl,
        start: 'top bottom',
        end: 'top center',
        toggleActions: 'none play none reset',
      })

      scrubTl.from(target, { yPercent: -50, ease: 'power2.out', duration: 1 })

      enterTl
        .from(elements, { yPercent: 125, stagger: 0.025 })
        .fromTo(
          paragraphSplit.lines,
          { yPercent: 50, clipPath: topClipPath },
          { yPercent: 0, clipPath: fullClipPath, stagger: 0.1 },
          '<'
        )
        .fromTo(button, { opacity: 0 }, { opacity: 1 }, '<')
    })
  }
}

function cleanup() {
  ctx && ctx.revert()
}

export default {
  init,
  cleanup,
}
