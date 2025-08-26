import { cursor, magneticCursor } from './utilities/customCursor/customCursor.js'
import { closeMenu } from './utilities/helper.js'
import { proxy } from './utilities/pageReadyListener.js'
import { getSmoothScroll } from './utilities/smoothScroll.js'
import { isDesktop } from './utilities/variables.js'
import { gsap, barba, ScrollTrigger } from './vendor.js'
import navbar from './animations/general/navbar.js'

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
        navbar.hideForTransition()

        const currentContainer = data.current.container
        const nextContainer = data.next.container
        const transitionOverlay = document.querySelector('[data-anm-page-transition="overlay"]')

        // Calculate current scroll position and viewport dimensions
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const viewportHeight = window.innerHeight
        const containerHeight = currentContainer.scrollHeight

        // Calculate clip-path to show only what's visible in viewport
        const topClip = (scrollTop / containerHeight) * 100
        const bottomClip = ((containerHeight - scrollTop - viewportHeight) / containerHeight) * 100

        // Ensure values are within bounds
        const topClipSafe = Math.max(0, Math.min(100, topClip))
        const bottomClipSafe = Math.max(0, Math.min(100, bottomClip))

        gsap.set(transitionOverlay, {
          autoAlpha: 0,
          display: 'flex',
        })

        // Set currentContainer to show only the viewport area
        gsap.set(currentContainer, {
          clipPath: `inset(${topClipSafe}% 0% ${bottomClipSafe}% 0%)`,
        })

        gsap.set(nextContainer, {
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
          },
        })

        getSmoothScroll().stop()

        // Calculate rotation based on container dimensions for consistent visual effect
        const containerRect = currentContainer.getBoundingClientRect()
        const targetDisplacement = -250 // pixels
        const rotationRadians = Math.atan(targetDisplacement / containerRect.width)
        const rotationDegrees = rotationRadians * (180 / Math.PI)

        // Calculate fixed pixel increase for consistent scaling
        const pixelIncrease = 500 // pixels to add to each dimension
        const currentWidth = containerRect.width
        const currentHeight = containerRect.height
        const newWidth = currentWidth + pixelIncrease
        const newHeight = currentHeight + pixelIncrease

        // Calculate transform origin relative to viewport position
        // This ensures rotation looks consistent regardless of scroll position
        const containerTop = currentContainer.offsetTop
        const viewportCenter = scrollTop + viewportHeight / 2
        const relativeY = ((viewportCenter - containerTop) / containerHeight) * 100
        const transformOriginY = Math.max(0, Math.min(100, relativeY))

        tl.to(
          currentContainer,
          {
            ease: 'power2.inOut',
            y: '-50vh',
            x: -pixelIncrease,
            width: newWidth,
            height: newHeight,
            rotateZ: rotationDegrees,
            transformOrigin: `right ${transformOriginY}%`,
          },
          0
        )
          .to(
            transitionOverlay,
            {
              autoAlpha: 1,
              ease: 'power4.out',
              duration: 1,
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
            '<-0.1'
          )
          .call(
            () => {
              done()
              getSmoothScroll().start()
              ScrollTrigger.refresh()
            },
            [],
            '>'
          )
      },
      after(data) {
        mm.add(isDesktop, () => {
          const customCursor = document.querySelector('.cb-cursor')
          if (customCursor) {
            customCursor.remove()
          }
          cursor.init()
          magneticCursor()
        })
        navbar.showAfterTransition()
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
