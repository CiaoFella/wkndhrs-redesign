import { topClipPath, fullClipPath, isDesktop, isTablet } from '../../utilities/variables.js'
import { gsap, ScrollTrigger, SplitType } from '../../vendor.js'

let context

const mm = gsap.matchMedia()

function init() {
  const section = document.querySelector('[data-hero]')
  if (section) {
    const heroType = section.dataset.hero
    context = gsap.context(() => {
      switch (heroType) {
        case 'home':
          const homeTl = gsap.timeline()

          const bgOverlay = section.querySelectorAll('[data-animate-hero=bg-overlay]')

          ScrollTrigger.create({
            trigger: section,
            animation: homeTl,
            start: 'top top',
            end: '75% bottom',
            scrub: true,
          })

          homeTl.fromTo(
            bgOverlay,
            {
              scaleY: 0,
            },
            {
              scaleY: 1,
              duration: 1,
              ease: 'none',
            }
          )
          break
        case 'sub':
          const subTl = gsap.timeline()
          const subScrollSection = document.querySelector('[data-scroll-hero=section]')
          const subScrollTitle = section.querySelector('[data-scroll-hero=title]')

          ScrollTrigger.create({
            trigger: subScrollSection,
            animation: subTl,
            start: 'top top',
            end: 'bottom top',
            toggleActions: 'play none none reverse',
          })

          const currentFontSize = Number(
            window.getComputedStyle(subScrollTitle).getPropertyValue('font-size').slice(0, -2)
          )

          let factor = 3

          mm.add(isTablet, () => {
            factor = 1.25
          })

          subTl.to(
            subScrollTitle,
            {
              fontSize: currentFontSize / factor,
              duration: 0.5,
              ease: 'power2.inOut',
            },
            '<'
          )

          break

        default:
          break
      }
    })
  }
}

function cleanup() {
  context && context.revert()
}

export default {
  init,
  cleanup,
}
