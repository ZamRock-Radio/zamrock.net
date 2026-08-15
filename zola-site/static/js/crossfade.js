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

  const BASE_URL = 'https://git.zamrock.net/ZamRock-Radio/Media-Assets/raw/branch/main/Radio/Stream-Assets/backgrounds'

  function probe (i) {
    if (stopped) return
    const img = document.createElement('img')
    img.src = `${BASE_URL}/website_bg_${String(i).padStart(3, '0')}.jpg`
    img.alt = ''
    img.onload = function () {
      misses = 0
      imgs.push(img)
      probe(i + 1)
    }
    img.onerror = function () {
      img.remove()
      misses++
      if (misses >= MISS_LIMIT || i >= MAX_BG) {
        stopped = true
        start(imgs.slice())
      } else {
        probe(i + 1)
      }
    }
    bg.appendChild(img)
  }

  function start (list) {
    if (!list.length) return
    const nEl = document.getElementById('n')
    const tEl = document.getElementById('t')
    if (tEl) tEl.textContent = String(list.length).padStart(3, '0')

    let cur = 0
    list[cur].classList.add('on')
    if (nEl) nEl.textContent = String(cur + 1).padStart(3, '0')

    setInterval(function () {
      const next = (cur + 1) % list.length
      list[cur].classList.remove('on')
      list[next].classList.add('on')
      cur = next
      if (nEl) nEl.textContent = String(cur + 1).padStart(3, '0')
    }, intervalMs)
  }

  probe(1)
})()