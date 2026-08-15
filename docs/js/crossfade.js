/* Crossfade background rotation.
 * Probes the website_bg series sequentially, skipping missing images,
 * then shuffles through all loaded backgrounds (play-through then reshuffle),
 * updating the #n gallery counter. */
(function () {
  'use strict'
  const MAX_BG = 500
  const MISS_LIMIT = 8
  const intervalMs = 15000
  const BASE_URL = 'https://git.zamrock.net/ZamRock-Radio/Media-Assets/raw/branch/main/Radio/Stream-Assets/backgrounds'
  const bg = document.querySelector('.bg')
  if (!bg) return

  const imgs = []
  let misses = 0
  let stopped = false
  let started = false
  let order = []
  let pos = 0
  const nEl = document.getElementById('n')
  const tEl = document.getElementById('t')

  function shuffle () {
    order = imgs.slice()
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = order[i]
      order[i] = order[j]
      order[j] = tmp
    }
    pos = 0
  }

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

  function show (img) {
    if (nEl) nEl.textContent = String(imgs.indexOf(img) + 1).padStart(3, '0')
    imgs.forEach(function (o) { o.classList.remove('on') })
    img.classList.add('on')
  }

  function start () {
    started = true
    shuffle()
    show(order[pos])
    setInterval(function () {
      if (!imgs.length) return
      pos++
      if (pos >= order.length) shuffle()
      show(order[pos])
    }, intervalMs)
  }

  probe(1)
})()