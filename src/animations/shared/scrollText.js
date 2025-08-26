import { gsap, ScrollTrigger, SplitText } from '../../vendor.js'
import { fullClipPath, isDesktop, isTablet, topClipPath } from '../../utilities/variables.js'
import { unwrapSpanAndPreserveClasses } from '../../utilities/helper.js'

gsap.registerPlugin(ScrollTrigger)

let ctx
let splitTextInstances = []

const mm = gsap.matchMedia()

function init() {
  ctx = gsap.context(() => {
    const textScrollSections = document.querySelectorAll('[data-anm-scroll-text=section]')

    textScrollSections.forEach(section => {
      const headline = section.querySelectorAll('[data-anm-scroll-text=headline]')
      const text = section.querySelectorAll('[data-anm-scroll-text=text]')
      const richText = section.querySelectorAll('[data-anm-scroll-text=rich]')

      const tl = gsap.timeline()

      ScrollTrigger.create({
        trigger: section,
        animation: tl,
        start: 'top bottom',
        end: 'top 60%',
        toggleActions: 'none play none reset',
      })

      if (headline && headline.length > 0) {
      }

      if (richText && richText.length > 0) {
        richText.forEach(item => {
          const richTextDelay = item.dataset.delay || 0
          const richTextDuration = item.dataset.duration || 2

          const textTarget = item.querySelector('p') || item

          const originalWhiteSpace = textTarget.style.whiteSpace
          const originalWidth = textTarget.style.width

          textTarget.style.whiteSpace = 'normal'
          if (!textTarget.style.width && textTarget.offsetWidth > 0) {
            textTarget.style.maxWidth = textTarget.offsetWidth + 'px'
          }

          const richTextSplit = new SplitText(textTarget, {
            type: 'words',
            linesClass: 'line++',
            deepSlice: true,
            aria: true,
            autoSplit: true,
            reduceWhiteSpace: false,
            force3D: true,
            mask: 'words',
          })

          textTarget.style.whiteSpace = originalWhiteSpace
          textTarget.style.width = originalWidth

          splitTextInstances.push(richTextSplit)

          mm.add(isTablet, () => {
            tl.from(richTextSplit.words, {
              yPercent: 100,
              duration: richTextDuration,
              delay: richTextDelay,
              stagger: {
                amount: 0.5,
              },
              ease: 'expo.out',
            })
          })

          mm.add(isDesktop, () => {
            tl.from(richTextSplit.words, {
              yPercent: 100,
              duration: richTextDuration,
              delay: richTextDelay,
              stagger: {
                amount: 0.5,
              },
              ease: 'expo.out',
            })
          })
        })
      }
    })
  })
}

function cleanup() {
  splitTextInstances.forEach(split => {
    split.revert()
  })
  splitTextInstances = []

  if (ctx) {
    ctx.revert()
  }

  mm.revert()
}

export default {
  init,
  cleanup,
}
