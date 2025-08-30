import { gsap, ScrollTrigger } from '../../vendor.js'

let ctx

function init() {
  const section = document.querySelector('[data-anm-footer=wrap]')

  if (!section) return

  if (section.querySelector('.is-contact')) {
    setupCopyFunctionality()
    return
  }

  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: 'none' } })
    const content = section.querySelector('[data-anm-footer=content]')

    ScrollTrigger.create({
      animation: tl,
      trigger: section,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true,
    })

    tl.fromTo(
      section,
      {
        clipPath: 'inset(50% 0% 0% 0%)',
      },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
      }
    ).from(
      content,
      {
        yPercent: -50,
      },
      '<'
    )

    setupCopyFunctionality()
  })
}

function setupCopyFunctionality() {
  const copyTarget =
    document.querySelector('[data-anm-fotter="copy-target"]') ||
    document.querySelector('[data-anm-footer="copy-target"]')
  const copyButton = document.querySelector('[data-anm-footer="copy-button"]')
  const copiedText = document.querySelector('[data-anm-footer="copied-text"]')

  if (!copyTarget || !copyButton || !copiedText) return

  gsap.set(copiedText, { yPercent: 100 })

  copyButton.addEventListener('click', async e => {
    e.preventDefault()

    try {
      const emailText = copyTarget.textContent.trim()

      await navigator.clipboard.writeText(emailText)

      animateCopiedText(copiedText)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      fallbackCopyTextToClipboard(copyTarget.textContent.trim(), copiedText)
    }
  })
}

function animateCopiedText(copiedText) {
  const tl = gsap.timeline()

  tl.to(copiedText, {
    yPercent: 0,
    duration: 0.4,
    ease: 'power2.out',
  })
    .to({}, { duration: 1.5 })
    .to(copiedText, {
      yPercent: -100,
      duration: 0.4,
      ease: 'power2.in',
    })
    .set(copiedText, { yPercent: 100 })
}

function fallbackCopyTextToClipboard(text, copiedText) {
  const textArea = document.createElement('textarea')
  textArea.value = text

  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      animateCopiedText(copiedText)
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

function cleanup() {
  ctx && ctx.revert()
}

export default {
  init,
  cleanup,
}
