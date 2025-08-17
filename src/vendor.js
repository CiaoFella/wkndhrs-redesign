import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger.js'
import Flip from 'gsap/Flip.js'
import MotionPathPlugin from 'gsap/MotionPathPlugin.js'
import barba from '@barba/core'
import SplitType from 'split-type'
import LocomotiveScroll from 'locomotive-scroll'

gsap.defaults({
  ease: 'power2.inOut',
  duration: 1,
})

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip)

export { gsap, ScrollTrigger, MotionPathPlugin, barba, SplitType, LocomotiveScroll, Flip }
