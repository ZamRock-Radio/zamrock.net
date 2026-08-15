/* Crossfade background rotation.
 * Builds the .bg slideshow from the local website_bg series and fades
 * between images every 15s, updating the #n gallery counter. */
(function () {
  'use strict'
  const BG_TOTAL = 21
  const intervalMs = 15000
  const bg = document.querySelector('.bg')
  if (!bg) return

  const imgs = []
  for (let i = 1; i <= BG_TOTAL; i++) {
    const img = document.createElement('img')
    img.src = `/img/website_bg/website_bg_${String(i).padStart(3, '0')}.jpg`
    img.alt = ''
    bg.appendChild(img)
    imgs.push(img)
  }
  if (!imgs.length) return

  const nEl = document.getElementById('n')
  const tEl = document.getElementById('t')
  if (tEl) tEl.textContent = String(imgs.length).padStart(3, '0')

  let cur = 0
  imgs[cur].classList.add('on')
  if (nEl) nEl.textContent = String(cur + 1).padStart(3, '0')

  setInterval(function () {
    const next = (cur + 1) % imgs.length
    imgs[cur].classList.remove('on')
    imgs[next].classList.add('on')
    cur = next
    if (nEl) nEl.textContent = String(cur + 1).padStart(3, '0')
  }, intervalMs)
})()
