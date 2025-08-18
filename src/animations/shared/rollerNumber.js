import { gsap, ScrollTrigger } from '../../vendor.js'

let ctx

function init() {
  const sections = document.querySelectorAll('[data-anm-roller-number="section"]')

  if (sections.length === 0) {
    return
  }

  ctx = gsap.context(() => {
    sections.forEach(section => {
      const rollerWraps = section.querySelectorAll('[data-anm-roller-number="wrap"]')

      rollerWraps.forEach((wrap, wrapIndex) => {
        const targetNumber = parseInt(wrap.dataset.number) || 0
        const rollers = wrap.querySelectorAll('[data-anm-roller-number="roller"]')

        const digits = targetNumber.toString().split('').map(Number)

        rollers.forEach((roller, index) => {
          if (index < digits.length) {
            const numberInners = roller.querySelectorAll('.g_number_inner')
            numberInners.forEach(inner => {
              gsap.set(inner, { y: '0em' })
            })
          }
        })

        // Create animation timeline
        const tl = gsap.timeline({ paused: true })

        rollers.forEach((roller, index) => {
          if (index < digits.length) {
            const targetDigit = digits[index]
            const numberInners = roller.querySelectorAll('.g_number_inner')

            numberInners.forEach(inner => {
              const yPosition = -10 - targetDigit

              tl.to(
                inner,
                {
                  y: `${yPosition}em`,
                  duration: 3,
                  ease: 'power3.inOut',
                  stagger: 0.1,
                },
                (digits.length - 1 - index) * 0.1 + wrapIndex * 0.2
              )
            })
          }
        })

        ScrollTrigger.create({
          animation: tl,
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none none',
        })
      })
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
