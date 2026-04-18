const API_URL = 'https://icy-voice-api.deathsmack-a51.workers.dev/';
const POLL_INTERVAL = 2000;

const playerState = {
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  baseReconnectDelay: 1000,
  reconnectTimer: null,
  wasPlaying: false
};

function getReconnectDelay() {
  const delay = playerState.baseReconnectDelay * Math.pow(2, playerState.reconnectAttempts);
  return Math.min(delay, 30000);
}

function reconnectStream(audio) {
  if (playerState.reconnectAttempts >= playerState.maxReconnectAttempts) {
    console.warn('Max reconnection attempts reached');
    return;
  }

  const delay = getReconnectDelay();
  console.log('Reconnecting in ' + delay + 'ms (attempt ' + (playerState.reconnectAttempts + 1) + ')');

  playerState.reconnectTimer = setTimeout(function() {
    playerState.reconnectAttempts++;
    const currentSrc = audio.src;
    audio.src = '';
    audio.src = currentSrc;
    audio.play().then(function() {
      playerState.reconnectAttempts = 0;
    }).catch(function() {});
  }, delay);
}

function handlePlayerError(audio) {
  console.warn('Player error:', audio.error);
  if (playerState.reconnectTimer) {
    clearTimeout(playerState.reconnectTimer);
    playerState.reconnectTimer = null;
  }
  if (playerState.wasPlaying) {
    reconnectStream(audio);
  }
}

function initPlayer() {
  const audio = document.getElementById('radio');

  if (audio) {
    audio.addEventListener('play', function() { playerState.wasPlaying = true; });
    audio.addEventListener('error', function() { handlePlayerError(audio); });
    audio.addEventListener('stalled', function() { console.warn('Player stalled'); audio.load(); });
    audio.addEventListener('pause', function() {
      if (playerState.wasPlaying) {
        handlePlayerError(audio);
      }
    });

    window.addEventListener('online', function() {
      if (playerState.wasPlaying) { audio.play().catch(function() {}); }
    });

    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && playerState.wasPlaying && audio.paused) {
        audio.play().catch(function() { handlePlayerError(audio); });
      }
    });
  }
}

async function fetchMetadata() {
  try {
    const resp = await fetch(API_URL, { mode: 'cors', cache: 'no-store' });
    if (!resp.ok) throw new Error('status ' + resp.status);
    const data = await resp.json();

    const title = (data.now_playing.song.title ||
      data.now_playing.song.text ||
      '').trim() || 'Unknown Track';
    const artist = (data.now_playing.song.artist || '').trim() || 'Unknown Artist';
    const album = (data.now_playing.song.album || '').trim() || 'Unknown Album';
    const playlist = (data.now_playing.playlist || '').trim() || 'Unknown Collection';

    return { title, artist, album, playlist };
  } catch (e) {
    console.warn('Metadata fetch failed:', e);
    return null;
  }
}

function renderMeta(info) {
  if (!info) return;
  document.getElementById('title').textContent = 'Song:   ' + info.title;
  document.getElementById('artist').textContent = 'Artist: ' + info.artist;
  document.getElementById('album').textContent = 'Album:  ' + info.album;
  document.getElementById('playlist').textContent = 'Playlist:' + info.playlist;
}

function startMetadataPolling() {
  const metaDiv = document.getElementById('meta');
  const update = async function() {
    const data = await fetchMetadata();
    if (data) renderMeta(data);
    else metaDiv.innerHTML = '<span>Loading track information…</span>';
  };
  update();
  setInterval(update, POLL_INTERVAL);
}

function initColorPicker() {
  const picker = document.getElementById('color-picker');
  if (!picker) return;
  picker.addEventListener('click', function(e) {
    if (!e.target.dataset.color) return;
    const color = {
      green: '#0f0',
      magenta: '#f0f',
      cyan: '#0ff',
      yellow: '#ff0',
      orange: '#ff8000'
    }[e.target.dataset.color] || '#0f0';

    document.body.style.color = color;
    const flash = document.createElement('div');
    flash.textContent = 'Color set to ' + e.target.dataset.color;
    flash.style.cssText =
      'position:fixed;bottom:30px;right:50%;transform:translateX(50%);' +
      'background:#111;color:#fff;padding:4px 8px;border-radius:4px;opacity:.8;';
    document.body.appendChild(flash);
    setTimeout(function() { flash.remove(); }, 1200);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initPlayer();
  startMetadataPolling();
  initColorPicker();
});
