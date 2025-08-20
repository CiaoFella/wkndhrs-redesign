import { gsap } from '../../vendor.js'

const mm = gsap.matchMedia()

export default function handlePageEnterAnimation(currentPage) {
  const tl = gsap.timeline({
    paused: true,
    defaults: { duration: 1, ease: 'power3.inOut' },
  })

  tl.to(currentPage, { opacity: 0, duration: 0.5 })
  tl.to(currentPage, { opacity: 1, duration: 0.5 })

  return tl
}
