import { gsap } from '../../vendor.js'
import Cursor from './cursor.js'
import Magnetic from './magnetic.js'
import { isDesktop } from '../variables.js'

const mm = gsap.matchMedia()

export let cursor

// Init cursor
mm.add(isDesktop, () => {
  cursor = new Cursor({
    container: 'body', // container to attach
    speed: 0.6, // default speed
    ease: 'expo.out', // default ease (gsap)
    visibleTimeout: 300, // disappear timeout
  })
})

export const magneticCursor = () => {
  const allMagnetic = document.querySelectorAll('[data-magnetic]')
  allMagnetic.forEach(magnetic => {
    const dataAttr = magnetic.getAttribute('data-magnetic')
    switch (dataAttr) {
      case 'tiny':
        new Magnetic(magnetic, {
          y: 0.09, // horizontal delta
          x: 0.09, // vertical delta
          s: 0.35, // speed
          rs: 1, // release speed
        })
        break
      case 'light':
        new Magnetic(magnetic, {
          y: 0.3, // horizontal delta
          x: 0.3, // vertical delta
          s: 0.2, // speed
          rs: 1, // release speed
        })
        break
      case 'strong':
        new Magnetic(magnetic, {
          y: 0.5, // horizontal delta
          x: 0.5, // vertical delta
          s: 0.2, // speed
          rs: 1, // release speed
        })
        break
    }
  })
}
