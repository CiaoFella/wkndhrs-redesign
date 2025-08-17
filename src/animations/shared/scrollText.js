import { gsap, ScrollTrigger, SplitType } from '../../vendor.js'
import { fullClipPath, isDesktop, isTablet, topClipPath } from '../../utilities/variables.js'
import { unwrapSpanAndPreserveClasses } from '../../utilities/helper.js'

gsap.registerPlugin(ScrollTrigger)

let ctx

const mm = gsap.matchMedia()

function init() {
  ctx = gsap.context(() => {
    const textScrollSections = document.querySelectorAll('[data-scroll-text=section]')

    textScrollSections.forEach(section => {
      const headline = section.querySelectorAll('[data-scroll-text=headline]')
      const text = section.querySelectorAll('[data-scroll-text=text]')

      const tl = gsap.timeline()

      ScrollTrigger.create({
        trigger: section,
        animation: tl,
        start: 'top bottom',
        end: 'top 60%',
        toggleActions: 'none play none reset',
      })

      if (headline && headline.length > 0) {
        headline.forEach(item => {
          unwrapSpanAndPreserveClasses(item)
          const headlineSplit = new SplitType(item, {
            types: 'lines',
          })
          const headlineDelay = item.dataset.delay || 0
          const headlineDuration = item.dataset.duration || 1

          let headlineY = 150

          mm.add(isTablet, () => {
            headlineY = 25
            tl.fromTo(
              headlineSplit.lines,
              { opacity: 0, y: headlineY },
              {
                opacity: 1,
                y: 0,
                duration: headlineDuration,
                delay: headlineDelay,
                stagger: 0.05,
              },
              '<+0.1'
            )
          })

          mm.add(isDesktop, () => {
            tl.fromTo(
              headlineSplit.lines,
              { clipPath: topClipPath, y: headlineY },
              {
                clipPath: fullClipPath,
                y: 0,
                duration: headlineDuration,
                delay: headlineDelay,
                stagger: 0.05,
                ease: 'expo.out',
              },
              '<+0.1'
            )
          })
        })
      }

      if (text && text.length > 0) {
        text.forEach(item => {
          const textDelay = item.dataset.delay || 0
          const textDuration = item.dataset.duration || 1

          const textSplit = new SplitType(item, {
            types: 'lines',
          })

          mm.add(isTablet, () => {
            tl.fromTo(
              textSplit.lines,
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                duration: textDuration,
                delay: textDelay,
                stagger: 0.05,
              },
              0
            )
          })

          mm.add(isDesktop, () => {
            tl.fromTo(
              textSplit.lines,
              { clipPath: topClipPath, y: 50 },
              {
                clipPath: fullClipPath,
                y: 0,
                duration: textDuration,
                delay: textDelay,
                stagger: 0.05,
                ease: 'expo.out',
              },
              0
            )
          })
        })
      }
    })
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
