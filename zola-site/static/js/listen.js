// "Places to listen" — the site doesn't host or stream music itself.
// The Play button opens a picker that links out to the public relays
// and apps where ZamRock Radio can actually be heard.
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('listenOpen')
  if (!openBtn) return

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
      url: 'https://streamroad.money/99c8b388-8449-4a6b-9dfa-ae14c4827144',
    },
    {
      icon: '💬',
      name: 'Chat bot',
      desc: 'Ask the bot in our chat to play the stream',
      url: 'https://matrix.to/#/#zamrock:unredacted.org',
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
      url: 'https://odysee.com/@ZamRockNet:7/live',
    },
    {
      icon: '🔥',
      name: 'Stoat',
      desc: 'Community chat + music bot',
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
        ${PLACES.map(p => `
          <a class="listen-item" href="${p.url}" target="_blank" rel="noopener">
            <span class="listen-icon">${p.icon}</span>
            <span class="listen-text">
              <span class="listen-name">${p.name}</span>
              <span class="listen-desc">${p.desc}</span>
            </span>
            <span class="listen-go">↗</span>
          </a>`).join('')}
      </div>
    </div>`
  document.body.appendChild(overlay)

  const close = () => overlay.classList.remove('open')
  const open = () => overlay.classList.add('open')

  openBtn.addEventListener('click', open)
  overlay.querySelector('.listen-close').addEventListener('click', close)
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close() })
})
