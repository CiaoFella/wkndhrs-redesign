import { gsap, ScrollTrigger } from '../../vendor.js'

let ctx
const easing = 'expo.inOut'
const duration = 1

function init() {
  const sections = document.querySelectorAll('[data-anm-rolling-slider="section"]')

  if (sections.length === 0) {
    return
  }

  ctx = gsap.context(() => {
    sections.forEach(section => {
      const scrollElement = section.querySelector('[data-anm-rolling-slider="scroll"]')
      const textTrack = section.querySelector('[data-anm-rolling-slider="text-track"]')
      const visualRoller = section.querySelector('[data-anm-rolling-slider="visual-roller"]')
      const indicator = section.querySelector('[data-anm-rolling-slider="indicator"]')

      if (!scrollElement || !textTrack || !visualRoller) {
        console.warn('🚨 Rolling slider: Missing required elements')
        return
      }

      const titles = textTrack.querySelectorAll('.ai_visual_list_title')
      const visuals = visualRoller.querySelectorAll('.ai_visual_list_visual')
      const progressBars = indicator ? indicator.querySelectorAll('[data-anm-rolling-slider="progress-bar"]') : []

      const totalSlides = Math.min(titles.length, visuals.length)

      if (totalSlides < 2) {
        console.warn('🚨 Rolling slider: Need at least 2 slides')
        return
      }

      gsap.set(visuals, { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(visuals[0], { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.set(progressBars, { width: '0%' })

      function triggerSlideTransition(fromSlide, toSlide) {
        gsap.to(textTrack, {
          y: `-${toSlide}em`,
          duration: duration,
          ease: easing,
        })

        if (
          fromSlide >= 0 &&
          fromSlide < visuals.length &&
          toSlide >= 0 &&
          toSlide < visuals.length &&
          fromSlide !== toSlide
        ) {
          const currentVisual = visuals[fromSlide]
          const nextVisual = visuals[toSlide]

          if (fromSlide < toSlide) {
            gsap.to(currentVisual, {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: duration,
              ease: easing,
            })

            gsap.fromTo(
              nextVisual,
              { clipPath: 'inset(100% 0% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: duration,
                ease: easing,
              }
            )
          } else {
            gsap.to(currentVisual, {
              clipPath: 'inset(100% 0% 0% 0%)',
              duration: duration,
              ease: easing,
            })

            gsap.fromTo(
              nextVisual,
              { clipPath: 'inset(0% 0% 100% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: duration,
                ease: easing,
              }
            )
          }
        }
      }

      const progressTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollElement,
          start: 'top+=100vh top',
          end: 'bottom+=100vh bottom',
          scrub: true,
          pinSpacing: false,
        },
      })

      const slideProgress = 1 / totalSlides

      for (let i = 0; i < totalSlides; i++) {
        const startProgress = i * slideProgress

        if (progressBars[i]) {
          progressTimeline.to(
            progressBars[i],
            {
              width: '100%',
              duration: slideProgress,
              ease: 'none',
            },
            startProgress
          )
        }
      }

      for (let i = 0; i < totalSlides; i++) {
        const progressCompletePoint = (i + 1) / totalSlides

        ScrollTrigger.create({
          trigger: scrollElement,
          start: 'top+=100vh top',
          end: 'bottom+=100vh bottom',
          toggleActions: 'play none none reverse',

          id: `discrete-${i}`,
          onUpdate: self => {
            const shouldTrigger = self.progress >= progressCompletePoint
            const wasTriggered = self.vars?.triggered || false

            if (shouldTrigger && !wasTriggered && self.direction === 1) {
              self.vars = { ...self.vars, triggered: true }

              triggerSlideTransition(i, i + 1)
            } else if (!shouldTrigger && wasTriggered && self.direction === -1) {
              self.vars = { ...self.vars, triggered: false }

              triggerSlideTransition(i + 1, i)
            }
          },
        })
      }
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
