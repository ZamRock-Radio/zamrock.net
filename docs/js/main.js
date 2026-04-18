/* global Image */

// Static header text
const headerElement = document.querySelector('h1.site-title');
const headerText = 'ZamRock Radio';

// Ensure header has a link
if (headerElement && !headerElement.querySelector('a')) {
  const link = document.createElement('a');
  link.href = 'https://zamrock.net';
  link.textContent = headerElement.textContent;
  headerElement.textContent = '';
  headerElement.appendChild(link);
}

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
];

let currentTitleIndex = 0;

// Function to animate tab title with random intervals
function animateTabTitle() {
  document.title = titles[currentTitleIndex];
  currentTitleIndex = (currentTitleIndex + 1) % titles.length;

  const interval = Math.floor(Math.random() * 2000) + 500;
  setTimeout(animateTabTitle, interval);
}

// Start the tab title animation
setTimeout(animateTabTitle, 1000);

// Keep header text content up to date while preserving the link
if (headerElement) {
  const link = headerElement.querySelector('a');
  if (link) {
    link.textContent = headerText;
  } else {
    headerElement.textContent = headerText;
    // Add link if it was missing
    const newLink = document.createElement('a');
    newLink.href = 'https://zamrock.net';
    newLink.textContent = headerText;
    headerElement.textContent = '';
    headerElement.appendChild(newLink);
  }
}

// Mobile menu toggle function
// eslint-disable-next-line no-unused-vars
function toggleMenu(event) {
  if (event) event.preventDefault();
  const menu = document.querySelector('.nav-menu');
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
}

// Close menu when clicking outside
window.addEventListener('click', (event) => {
  const menu = document.querySelector('.nav-menu');
  const menuToggle = document.querySelector('.mobile-menu-toggle');

  if (menu && menuToggle && !menu.contains(event.target) && !menuToggle.contains(event.target)) {
    menu.style.display = 'none';
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  const menu = document.querySelector('.nav-menu');
  const menuToggle = document.querySelector('.mobile-menu-toggle');

  if (window.innerWidth > 768) {
    if (menu) menu.style.display = '';
  } else if (menuToggle && menu) {
    menu.style.display = 'none';
  }
});

// Background images array with full URLs
const backgroundImages = [
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_001.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_002.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_003.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_004.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_005.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_006.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_007.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_008.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_009.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_010.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_011.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_012.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_013.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_014.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_015.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_016.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_017.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_018.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_019.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_020.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_021.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_022.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_023.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_024.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_025.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_026.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_027.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_028.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_029.jpg',
  'https://raw.githubusercontent.com/DeathSmack/zamrock/main/docs/img/website_bg/website_bg_030.jpg'
];

function setRandomBackground() {
  if (backgroundImages.length === 0) return;
  const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

  // Preload the image before setting it as background
  const img = new Image();
  img.onload = function() {
    // Only update the background if the image loads successfully
    document.body.style.backgroundImage = `url('${randomImage}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
  };
  img.src = randomImage;
}

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
};

function getReconnectDelay() {
  const delay = playerState.baseReconnectDelay * Math.pow(2, playerState.reconnectAttempts);
  return Math.min(delay, playerState.maxReconnectDelay);
}

function setPlayerStatus(status, button) {
  playerState.status = status;

  if (!button) return;

  switch (status) {
    case 'idle':
      button.textContent = playerState.hasPlayedBefore ? 'Play' : playerState.initialText;
      button.disabled = false;
      break;
    case 'playing':
      button.textContent = 'Stop';
      button.disabled = false;
      break;
    case 'paused':
      button.textContent = 'Resume';
      button.disabled = false;
      break;
    case 'error':
      button.textContent = 'Error - Tap to Retry';
      button.disabled = false;
      playerState.reconnectAttempts = 0;
      break;
    case 'reconnecting':
      button.textContent = 'Reconnecting...';
      button.disabled = true;
      break;
  }
}

function reconnectStream(audio, button) {
  if (playerState.reconnectAttempts >= playerState.maxReconnectAttempts) {
    console.warn('Max reconnection attempts reached');
    setPlayerStatus('error', button);
    return;
  }

  const delay = getReconnectDelay();
  console.log(`Reconnecting in ${delay}ms (attempt ${playerState.reconnectAttempts + 1})`);

  setPlayerStatus('reconnecting', button);

  // Store the current source and try to reload
  const currentSrc = audio.src;

  playerState.reconnectTimer = setTimeout(() => {
    playerState.reconnectAttempts++;

    // Reset and try to play again
    audio.src = '';
    audio.src = currentSrc;

    audio.play().then(() => {
      playerState.reconnectAttempts = 0;
      playerState.wasPlaying = true;
      playerState.hasPlayedBefore = true;
      setPlayerStatus('playing', button);
    }).catch(() => {
      // Will trigger error event, which will call reconnectStream again
    });
  }, delay);
}

function handlePlayerError(audio, button) {
  console.warn('Player error:', audio.error);

  // Cancel any pending reconnection
  if (playerState.reconnectTimer) {
    clearTimeout(playerState.reconnectTimer);
    playerState.reconnectTimer = null;
  }

  // If was playing, attempt to reconnect
  if (playerState.wasPlaying) {
    reconnectStream(audio, button);
  } else {
    setPlayerStatus('error', button);
  }
}

function handlePlayerStalled(audio, button) {
  console.warn('Player stalled, attempting to recover...');
  audio.load();
}

// Initialize background rotation on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set initial background
  setRandomBackground();

  // Rotate background every 20 seconds
  const backgroundInterval = setInterval(setRandomBackground, 20000);

  // Cleanup interval when page is unloaded
  window.addEventListener('beforeunload', () => {
    clearInterval(backgroundInterval);
  });

  const audio = document.getElementById('radioStream');
  const playButton = document.getElementById('playButton');
  const volumeSlider = document.getElementById('volumeSlider');

  if (audio && playButton && volumeSlider) {
    // Store initial button text
    playerState.initialText = playButton.textContent || 'Play';

    // Initialize volume
    audio.volume = volumeSlider.value / 100;

    // Listen for network online status
    window.addEventListener('online', () => {
      console.log('Network online, attempting to reconnect...');
      if (playerState.wasPlaying || playerState.hasPlayedBefore) {
        reconnectStream(audio, playButton);
      }
    });

    // Listen for page visibility changes (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Page visible, checking stream status...');
        // Only reconnect if we were playing and stream is dead
        if ((playerState.wasPlaying || playerState.hasPlayedBefore) && audio.paused && !playerState.reconnectTimer) {
          audio.play().catch(() => {
            handlePlayerError(audio, playButton);
          });
        }
      }
    });

    // Player event listeners for error handling
    audio.addEventListener('error', () => {
      handlePlayerError(audio, playButton);
    });

    audio.addEventListener('stalled', () => {
      handlePlayerStalled(audio, playButton);
    });

    audio.addEventListener('pause', () => {
      // If we weren't explicitly pausing, this might be a stream drop
      if (playerState.status === 'playing') {
        console.warn('Stream paused unexpectedly');
        playerState.wasPlaying = true;
        handlePlayerError(audio, playButton);
      }
    });

    audio.addEventListener('playing', () => {
      playerState.wasPlaying = true;
      playerState.hasPlayedBefore = true;
      playerState.reconnectAttempts = 0;
      setPlayerStatus('playing', playButton);
    });

    audio.addEventListener('ended', () => {
      setPlayerStatus('paused', playButton);
    });

    // Play/pause toggle
    playButton.addEventListener('click', () => {
      const currentStatus = playerState.status;

      function doPlay(onSuccess) {
        audio.play().then(() => {
          playerState.wasPlaying = true;
          playerState.hasPlayedBefore = true;
          if (onSuccess) onSuccess();
          setPlayerStatus('playing', playButton);
        }).catch(() => {
          if (currentStatus === 'reconnecting') {
            setPlayerStatus('error', playButton);
          } else {
            handlePlayerError(audio, playButton);
          }
        });
      }

      // If error or idle, try to play
      if (currentStatus === 'error' || currentStatus === 'idle') {
        playerState.reconnectAttempts = 0;
        doPlay();
        return;
      }

      // If reconnecting, cancel and allow manual retry
      if (currentStatus === 'reconnecting') {
        if (playerState.reconnectTimer) {
          clearTimeout(playerState.reconnectTimer);
          playerState.reconnectTimer = null;
        }
        doPlay();
        return;
      }

      // Normal play/pause toggle
      if (audio.paused) {
        doPlay();
      } else {
        audio.pause();
        playerState.wasPlaying = playerState.status === 'playing';
        setPlayerStatus('paused', playButton);
      }
    });

    // Adjust volume
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value / 100;
    });

    // Expose player controls for external use
    window.zamrockPlayer = {
      play: () => audio.play(),
      pause: () => audio.pause(),
      getStatus: () => playerState.status,
      getVolume: () => audio.volume,
      setVolume: (v) => { audio.volume = v; }
    };
  }
});
