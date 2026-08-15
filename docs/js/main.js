/* global Image, localStorage */

// Array of titles for tab animation
const titles = [
  '24m20ck 24d10',
  'Z4m20ck 24d10',
  'Z4m20ck R4d10',
  'Z4mR0ck R4d10',
  'Z4mR0ck R4di0',
  'ZamR0ck R4di0',
  'ZamR0ck R4dio',
  'ZamRock R4dio',
  'ZamRock Radio',
  'ZamRock Radio.',
  'ZamRock Radio..',
  'ZamRock Radio...',
  'ZamRock Radio..!',
  'ZamRock Radio.!',
  'ZamRock Radio!',
  'ZamRock Radio;!',
  'ZamRock Radio ;!',
  'ZamRock Radio ;P',
  'ZamRock Radio',
  'ZamRock Radio',
  'ZamRock R4dio',
  'ZamR0ck R4dio',
  'ZamR0ck R4di0',
  'Z4mR0ck R4di0',
  'Z4mR0ck R4d10',
  'Z4m20ck R4d10',
  'Z4m20ck 24d10',
  '24m20ck 24d10'
]

let currentTitleIndex = 0

// Function to animate tab title with random intervals
function animateTabTitle () {
  document.title = titles[currentTitleIndex]
  currentTitleIndex = (currentTitleIndex + 1) % titles.length

  const interval = Math.floor(Math.random() * 2000) + 500
  setTimeout(animateTabTitle, interval)
}

// Start the tab title animation
setTimeout(animateTabTitle, 1000)

// Mobile menu toggle function
// eslint-disable-next-line no-unused-vars
function toggleMenu (event) {
  if (event) event.preventDefault()
  const menu = document.querySelector('.nav-menu')
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block'
  }
}

// Close menu when clicking outside
window.addEventListener('click', (event) => {
  const menu = document.querySelector('.nav-menu')
  const menuToggle = document.querySelector('.mobile-menu-toggle')

  if (menu && menuToggle && !menu.contains(event.target) && !menuToggle.contains(event.target)) {
    menu.style.display = 'none'
  }
})

// Handle window resize
window.addEventListener('resize', () => {
  const menu = document.querySelector('.nav-menu')
  const menuToggle = document.querySelector('.mobile-menu-toggle')

  if (window.innerWidth > 768) {
    if (menu) menu.style.display = ''
  } else if (menuToggle && menu) {
    menu.style.display = 'none'
  }
})

// Audio player state management
const playerState = {
  status: 'idle', // idle, playing, paused, error, reconnecting
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  baseReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectTimer: null,
  wasPlaying: false,
  hasPlayedBefore: false,
  initialText: 'Play'
}

function getReconnectDelay () {
  const delay = playerState.baseReconnectDelay * Math.pow(2, playerState.reconnectAttempts)
  return Math.min(delay, playerState.maxReconnectDelay)
}

function setPlayerStatus (status, button) {
  playerState.status = status

  if (!button) return

  const statusEl = document.querySelector('[data-player-status]')
  let label = ''

  switch (status) {
    case 'idle':
      label = playerState.hasPlayedBefore ? 'Play' : playerState.initialText
      button.disabled = false
      break
    case 'playing':
      label = 'Stop'
      button.disabled = false
      break
    case 'paused':
      label = 'Resume'
      button.disabled = false
      break
    case 'error':
      label = 'Error - Tap to Retry'
      button.disabled = false
      playerState.reconnectAttempts = 0
      break
    case 'reconnecting':
      label = 'Reconnecting...'
      button.disabled = true
      break
  }

  if (statusEl) {
    statusEl.textContent = label
    button.textContent = status === 'playing' ? '⏸' : '▶'
    button.setAttribute('aria-label', label)
  } else {
    button.textContent = label
  }
}

function reconnectStream (audio, button) {
  if (playerState.reconnectAttempts >= playerState.maxReconnectAttempts) {
    console.warn('Max reconnection attempts reached')
    setPlayerStatus('error', button)
    return
  }

  const delay = getReconnectDelay()
  console.log(`Reconnecting in ${delay}ms (attempt ${playerState.reconnectAttempts + 1})`)

  setPlayerStatus('reconnecting', button)

  // Store the current source and try to reload
  const currentSrc = audio.src

  playerState.reconnectTimer = setTimeout(() => {
    playerState.reconnectAttempts++

    // Reset and try to play again
    audio.src = ''
    audio.src = currentSrc

    audio.play().then(() => {
      playerState.reconnectAttempts = 0
      playerState.wasPlaying = true
      playerState.hasPlayedBefore = true
      setPlayerStatus('playing', button)
    }).catch(() => {
      // Will trigger error event, which will call reconnectStream again
    })
  }, delay)
}

function handlePlayerError (audio, button) {
  console.warn('Player error:', audio.error)

  // Cancel any pending reconnection
  if (playerState.reconnectTimer) {
    clearTimeout(playerState.reconnectTimer)
    playerState.reconnectTimer = null
  }

  // If was playing, attempt to reconnect
  if (playerState.wasPlaying) {
    reconnectStream(audio, button)
  } else {
    setPlayerStatus('error', button)
  }
}

function handlePlayerStalled (audio, button) {
  console.warn('Player stalled, attempting to recover...')
  audio.load()
}

// Initialize player on page load
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('radioStream')
  const playButton = document.getElementById('playButton')
  const volumeSlider = document.getElementById('volumeSlider')

  if (audio && playButton && volumeSlider) {
    // Store initial button text
    const statusEl = document.querySelector('[data-player-status]')
    playerState.initialText = (statusEl && statusEl.textContent) || playButton.textContent || 'Play'

    // Initialize volume
    audio.volume = volumeSlider.value / 100

    // Listen for network online status
    window.addEventListener('online', () => {
      console.log('Network online, attempting to reconnect...')
      if (playerState.wasPlaying || playerState.hasPlayedBefore) {
        reconnectStream(audio, playButton)
      }
    })

    // Listen for page visibility changes (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Page visible, checking stream status...')
        // Only reconnect if we were playing and stream is dead
        if ((playerState.wasPlaying || playerState.hasPlayedBefore) && audio.paused && !playerState.reconnectTimer) {
          audio.play().catch(() => {
            handlePlayerError(audio, playButton)
          })
        }
      }
    })

    // Player event listeners for error handling
    audio.addEventListener('error', () => {
      handlePlayerError(audio, playButton)
    })

    audio.addEventListener('stalled', () => {
      handlePlayerStalled(audio, playButton)
    })

    audio.addEventListener('pause', () => {
      // If we weren't explicitly pausing, this might be a stream drop
      if (playerState.status === 'playing') {
        console.warn('Stream paused unexpectedly')
        playerState.wasPlaying = true
        handlePlayerError(audio, playButton)
      }
    })

    audio.addEventListener('playing', () => {
      playerState.wasPlaying = true
      playerState.hasPlayedBefore = true
      playerState.reconnectAttempts = 0
      setPlayerStatus('playing', playButton)
    })

    audio.addEventListener('ended', () => {
      setPlayerStatus('paused', playButton)
    })

    // Play/pause toggle
    playButton.addEventListener('click', () => {
      const currentStatus = playerState.status

      function doPlay (onSuccess) {
        audio.play().then(() => {
          playerState.wasPlaying = true
          playerState.hasPlayedBefore = true
          if (onSuccess) onSuccess()
          setPlayerStatus('playing', playButton)
        }).catch(() => {
          if (currentStatus === 'reconnecting') {
            setPlayerStatus('error', playButton)
          } else {
            handlePlayerError(audio, playButton)
          }
        })
      }

      // If error or idle, try to play
      if (currentStatus === 'error' || currentStatus === 'idle') {
        playerState.reconnectAttempts = 0
        doPlay()
        return
      }

      // If reconnecting, cancel and allow manual retry
      if (currentStatus === 'reconnecting') {
        if (playerState.reconnectTimer) {
          clearTimeout(playerState.reconnectTimer)
          playerState.reconnectTimer = null
        }
        doPlay()
        return
      }

      // Normal play/pause toggle
      if (audio.paused) {
        doPlay()
      } else {
        audio.pause()
        playerState.wasPlaying = playerState.status === 'playing'
        setPlayerStatus('paused', playButton)
      }
    })

    // Adjust volume
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value / 100
    })

    // Expose player controls for external use
    window.zamrockPlayer = {
      play: () => audio.play(),
      pause: () => audio.pause(),
      getStatus: () => playerState.status,
      getVolume: () => audio.volume,
      setVolume: (v) => { audio.volume = v }
    }
  }
})

// Immersive mode toggle: fold layout to player-only
document.addEventListener('DOMContentLoaded', () => {
  const foldButton = document.getElementById('foldButton')
  if (!foldButton) return

  const foldLabel = foldButton.getAttribute('data-label-fold') || 'Enter Now Playing mode'
  const unfoldLabel = foldButton.getAttribute('data-label-unfold') || 'Exit Now Playing mode'

  const setImmersive = (on) => {
    document.body.classList.toggle('immersive', on)
    try {
      localStorage.setItem('zamrock.immersive', on ? '1' : '0')
    } catch (e) { /* localStorage unavailable */ }
    foldButton.setAttribute('aria-label', on ? unfoldLabel : foldLabel)
    foldButton.setAttribute('title', on ? unfoldLabel : foldLabel)
  }

  foldButton.addEventListener('click', () => {
    setImmersive(!document.body.classList.contains('immersive'))
  })

  try {
    if (localStorage.getItem('zamrock.immersive') === '1') setImmersive(true)
  } catch (e) { /* localStorage unavailable */ }
})

