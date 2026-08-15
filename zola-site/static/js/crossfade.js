/* Crossfade background rotation.
 * Probes the website_bg series sequentially, skipping missing images,
 * and fades between loaded images every 15s, updating the #n gallery counter. */
(function () {
  'use strict'
  const MAX_BG = 500
  const MISS_LIMIT = 8
  const intervalMs = 15000
  const bg = document.querySelector('.bg')
  if (!bg) return

const imgs = []
  let misses = 0
  let stopped = false
  let started = false
  let cur = 0
  const nEl = document.getElementById('n')
  const tEl = document.getElementById('t')

  function probe (i) {
    if (stopped) return
    const img = document.createElement('img')
    img.src = `${BASE_URL}/website_bg_${String(i).padStart(3, '0')}.jpg`
    img.alt = ''
    img.onload = function () {
      misses = 0
      imgs.push(img)
      if (tEl) tEl.textContent = String(imgs.length).padStart(3, '0')
      if (!started) start()
      probe(i + 1)
    }
    img.onerror = function () {
      img.remove()
      misses++
      if (misses >= MISS_LIMIT || i >= MAX_BG) stopped = true
      else probe(i + 1)
    }
    bg.appendChild(img)
  }

  function start () {
    started = true
    imgs[cur].classList.add('on')
    if (nEl) nEl.textContent = String(cur + 1).padStart(3, '0')
    setInterval(function () {
      if (!imgs.length) return
      const next = (cur + 1) % imgs.length
      imgs[cur].classList.remove('on')
      imgs[next].classList.add('on')
      cur = next
      if (nEl) nEl.textContent = String(cur + 1).padStart(3, '0')
    }, intervalMs)
  }

  probe(1)
})()