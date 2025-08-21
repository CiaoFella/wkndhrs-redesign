import { cursor, magneticCursor } from './utilities/customCursor/customCursor.js'
import { closeMenu } from './utilities/helper.js'
import { proxy } from './utilities/pageReadyListener.js'
import { isDesktop } from './utilities/variables.js'
import { gsap, barba, ScrollTrigger } from './vendor.js'

gsap.registerPlugin(ScrollTrigger)

const mm = gsap.matchMedia()

barba.hooks.before(data => {
  data.next.container.classList.add('is-animating')
})

barba.hooks.after(data => {
  data.next.container.classList.remove('is-animating')
})

barba.init({
  preventRunning: true,
  debug: false,
  transitions: [
    {
      name: 'default-transition',
      sync: true,
      leave(data) {
        const done = this.async()
        proxy.pageReady = false
        closeMenu()

        const currentContainer = data.current.container
        const nextContainer = data.next.container
        const transitionOverlay = document.querySelector('[data-anm-page-transition="overlay"]')

        gsap.set(transitionOverlay, {
          autoAlpha: 0,
          display: 'flex',
        })

        gsap.set([currentContainer, nextContainer], {
          clipPath: 'inset(0% 0% 0% 0%)',
        })

        // Animation sequence using GSAP (adapted from slideshow)
        const tl = gsap.timeline({
          defaults: {
            duration: 1,
          },
          onComplete: () => {
            gsap.set(transitionOverlay, {
              display: 'none',
            })
            gsap.set([currentContainer, nextContainer], {
              clipPath: 'unset',
            })
            done()
          },
        })

        tl.to(
          currentContainer,
          {
            ease: 'power2.inOut',
            y: '-50dvh',
            startAt: {
              clipPath: 'inset(0% 0% 0% 0%)',
            },
            clipPath: 'inset(0% 0% 100% 0%)',
            scale: 1,
          },
          0
        )
          .to(
            currentContainer.firstElementChild,
            {
              scale: 1.5,
              rotateZ: -5,
              ease: 'power2.inOut',
              duration: 1,
              transformOrigin: 'top right',
            },
            0
          )
          .to(
            transitionOverlay,
            {
              autoAlpha: 1,
              ease: 'power4.out',
            },
            '<'
          )
          .fromTo(
            nextContainer,
            {
              y: '100dvh',
              clipPath: 'inset(100% 0% 0% 0%)',
            },
            {
              ease: 'power4.out',
              y: '0dvh',
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.5,
            },
            '<'
          )
          .fromTo(
            nextContainer.firstElementChild,
            {
              scale: 1.2,
            },
            {
              scale: 1,
              ease: 'power4.out',
            },
            '<'
          )
      },
      after(data) {
        mm.add(isDesktop, () => {
          const customCursor = document.querySelector('.cb-cursor')
          customCursor.remove()
          cursor.init()
          magneticCursor()
        })
        proxy.pageReady = true
      },
    },
  ],
  views: [
    {
      namespace: 'home',
      beforeEnter({ next }) {
        // Additional logic for home page before entering
      },
    },
    {
      namespace: 'about',
      beforeEnter({ next }) {
        // Additional logic for about page before entering
      },
    },
    {
      namespace: 'contact',
      beforeEnter({ next }) {
        // Additional logic for contact page before entering
      },
    },
  ],
})

export default barba
