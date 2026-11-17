// "Places to listen" — the site doesn't host or stream music itself.
// The Play button opens a picker that links out to the public relays
// and apps where ZamRock Radio can actually be heard.
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('listenOpen')
  if (!openBtn) return

  // StreamRoad live events are Nostr kind:30311 authored by the
  // StreamRoad pubkey; the `d` tag is the stream id used in URLs.
  const SR_AUTHOR = '849317bd734111b02d36091af6611ffb55b85a12364a9849bc14d41c6012f95d'
  const SR_FALLBACK_ID = '99c8b388-8449-4a6b-9dfa-ae14c4827144'
  const SR_RELAYS = ['wss://relay.damus.io', 'wss://relay.primal.net', 'wss://nos.lol']
  const SR_MATCH = 'zamrock'

  const tag = (ev, name) => (ev.tags || []).find(t => t[0] === name)

  // Ask Nostr relays for the current ZamRock live event; returns the
  // stream id (d tag) or null. ~5s budget across the relay pool.
  function resolveStreamRoadId () {
    return new Promise((resolve) => {
      let done = false
      let pending = SR_RELAYS.length
      const finish = (id) => {
        if (done) return
        done = true
        resolve(id || null)
      }
      const timer = setTimeout(() => finish(null), 5000)
      SR_RELAYS.forEach(url => {
        let ws
        try { ws = new WebSocket(url) } catch (e) { if (--pending === 0) { clearTimeout(timer); finish(null) } return }
        const to = setTimeout(() => { try { ws.close() } catch (e) {} }, 4500)
        // onerror and onclose both fire for one failure — settle once
        // so a single dead relay can't drain the whole pool's budget.
        let settled = false
        const bail = () => {
          if (settled) return
          settled = true
          clearTimeout(to)
          if (--pending === 0) { clearTimeout(timer); finish(null) }
        }
        ws.onopen = () => ws.send(JSON.stringify(['REQ', 'sr', { kinds: [30311], authors: [SR_AUTHOR], limit: 20 }]))
        ws.onmessage = (m) => {
          let msg
          try { msg = JSON.parse(m.data) } catch (e) { return }
          if (!Array.isArray(msg) || msg[0] !== 'EVENT' || !msg[2]) return
          const ev = msg[2]
          const title = String((tag(ev, 'title') || [])[1] || '').toLowerCase()
          const status = String((tag(ev, 'status') || [])[1] || '').toLowerCase()
          const d = (tag(ev, 'd') || [])[1]
          if (d && status === 'live' && title.includes(SR_MATCH)) {
            clearTimeout(to); try { ws.close() } catch (e) {}
            finish(d)
          }
        }
        ws.onclose = ws.onerror = bail
      })
    })
  }

  // Confirm a stream id actually serves a live playlist right now.
  // GET + body sniff, not HEAD: the HLS endpoint's HEAD/length handling
  // is flaky (200 headers, broken body) — a real playlist starts with
  // #EXTM3U. mpegurl content-type alone is accepted since some live
  // playlists are served chunked without a readable body.
  async function streamIdIsLive (id) {
    try {
      const ctl = new AbortController()
      const t = setTimeout(() => ctl.abort(), 6000)
      const r = await fetch(`https://api.streamroad.money/${id}/hls/live.m3u8`, { signal: ctl.signal })
      clearTimeout(t)
      if (!r.ok) return false
      const ct = (r.headers.get('content-type') || '').toLowerCase()
      if (ct.includes('mpegurl')) return true
      const body = await r.text()
      return body.includes('#EXTM3U')
    } catch (e) { return false }
  }

  const PLACES = [
    {
      icon: '🎧',
      name: 'MU Relay',
      desc: 'Relay cube — highest quality audio',
      url: 'https://zamrock-relay.mega-utilities.com/',
    },
    {
      icon: '📻',
      name: 'Nostr',
      desc: 'ZamZam player on Nostr',
      url: 'https://nostr.zamrock.net/',
    },
    {
      icon: '📺',
      name: 'StreamRoad',
      desc: 'Live video feed + chat',
      url: 'https://streamroad.money/',
      dynamic: true,
    },
    {
      icon: '📶',
      name: 'Zeno FM',
      desc: 'Low bitrate — light on data',
      url: 'https://stream.zeno.fm/a10b9oqbgkevv',
    },
    {
      icon: '▶️',
      name: 'Odysee',
      desc: 'Video stream on Odysee',
      url: 'https://odysee.com/@Live-Radio:a/ZamRock:1',
    },
    {
      icon: '🔥',
      name: 'Stoat',
      desc: 'Chat bot plays the stream — join us',
      url: 'https://stoat.chat/invite/CsjKzYWm',
    },
  ]

  const overlay = document.createElement('div')
  overlay.className = 'listen-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.innerHTML = `
    <div class="listen-sheet">
      <div class="listen-head">
        <h2>ZamRock Radio</h2>
        <button class="listen-close" aria-label="Close">✕</button>
      </div>
      <p class="listen-note">
        We don't host music on this website — ZamRock is a live radio
        broadcast. Pick a place to listen:
      </p>
      <div class="listen-list">
        ${PLACES.map((p, i) => `
          <a class="listen-item" data-i="${i}" href="${p.url}" target="_blank" rel="noopener">
            <span class="listen-icon">${p.icon}</span>
            <span class="listen-text">
              <span class="listen-name">${p.name}</span>
              <span class="listen-desc" data-desc>${p.desc}</span>
            </span>
            <span class="listen-go">↗</span>
          </a>`).join('')}
      </div>
    </div>`
  document.body.appendChild(overlay)

  const srItem = overlay.querySelector('.listen-item[data-i="2"]')
  const srDesc = srItem && srItem.querySelector('[data-desc]')

  // Resolve + verify the live StreamRoad stream, then point the card
  // at it. Falls back to the last known id, then the app homepage.
  async function refreshStreamRoad () {
    if (!srItem) return
    srDesc.textContent = 'Finding live stream…'
    let id = await resolveStreamRoadId()
    if (id && !(await streamIdIsLive(id))) id = null
    if (!id && (await streamIdIsLive(SR_FALLBACK_ID))) id = SR_FALLBACK_ID
    srItem.href = id ? `https://streamroad.money/${id}` : 'https://streamroad.money/'
    srDesc.textContent = id
      ? 'Live video feed + chat'
      : 'Live video feed + chat — open app'
  }

  const close = () => overlay.classList.remove('open')
  const open = () => {
    overlay.classList.add('open')
    refreshStreamRoad()
  }

  openBtn.addEventListener('click', open)
  overlay.querySelector('.listen-close').addEventListener('click', close)
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close() })
})
