import lenis from '../../utilities/smoothScroll.js'
import { gsap } from '../../vendor.js'

let ctx

function init() {
  const section = document.querySelector('[data-menu-mobile=section]')

  if (section) {
    const items = section.querySelectorAll('[data-menu-mobile=item]')
    const trigger = document.querySelector('[data-menu-mobile=trigger]')
    const triggerItems = trigger.querySelector('[data-menu-mobile=trigger-items]')
    const bg = section.querySelector('[data-menu-mobile=bg]')

    ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 1, ease: 'power3.inOut' },
      })

      tl.set(section, { display: 'flex' })

      tl.to(triggerItems, { yPercent: -100, duration: 0.5 })
        .from(
          bg,
          {
            scaleY: 0,
            transformOrigin: '50% 0%',
            duration: 1,
          },
          '<+0.2'
        )
        .from(items, { yPercent: 125, stagger: 0.05 }, '<')

      trigger.addEventListener('click', () => {
        trigger.classList.toggle('is-active')

        if (trigger.classList.contains('is-active')) {
          tl.play()
          lenis.stop()
        } else {
          tl.reverse()
          lenis.start()
        }
      })
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
