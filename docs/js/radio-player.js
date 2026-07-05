(function () {
  'use strict';

  var STREAMS = {
    main: {
      hifi: 'https://wild-haze-hifi-tmp.deathsmack-a51.workers.dev',
      standard: 'https://divine-paper-3624-tmp.deathsmack-a51.workers.dev'
    },
    mega: {
      hifi: 'https://megason-radioinfo.deathsmack-a51.workers.dev/hifi.aac'
    },
    anomaly: {
      hifi: 'https://anomaly.fm/radio',
      standard: 'https://anomaly.fm/radio'
    }
  };

  var RELAY_ORDER = ['main', 'mega', 'anomaly'];

  var root = document.documentElement;
  var el = function (role) { return document.querySelector('[data-zm="' + role + '"]'); };
  var toggleBtn = el('toggle');
  var statusEl = el('status');
  var signalEl = el('signal');
  var volumeEl = el('volume');
  var relayEl = el('relay');
  var qualityEl = el('quality');
  var playBtn = document.querySelector('.t-play');
  var stopBtn = document.querySelector('.transport button:nth-child(2)');
  var prevBtn = el('prev-relay');
  var nextBtn = el('next-relay');

  var audio = new Audio();
  audio.preload = 'none';
  var wantPlaying = false;
  var isSwitching = false;

  var PLAY_STATES = ['zm-on', 'zm-off', 'zm-tuning', 'zm-receiving', 'zm-streaming', 'zm-buffering'];
  var setPlayState = function () {
    var classes = Array.prototype.slice.call(arguments);
    root.classList.remove.apply(root.classList, PLAY_STATES);
    root.classList.add.apply(root.classList, classes);
  };
  var setSignal = function (text) { if (signalEl) signalEl.textContent = text; };
  var setStatusLine = function (text) {
    if (!statusEl) return;
    statusEl.title = text;
    statusEl.textContent = text;
  };

  var applyVolume = function () { audio.volume = volumeEl ? Number(volumeEl.value) / 100 : 0.8; };

  if (volumeEl) {
    var saved = localStorage.getItem('zamrock-vol');
    if (saved !== null) {
      var v = Number(saved);
      if (Number.isFinite(v) && v >= 0 && v <= 100) volumeEl.value = String(v);
    }
    volumeEl.addEventListener('input', function () {
      applyVolume();
      localStorage.setItem('zamrock-vol', volumeEl.value);
    });
  }
  applyVolume();

  function getStreamUrl() {
    var relay = relayEl ? relayEl.value : 'main';
    var quality = qualityEl ? qualityEl.value : 'hifi';
    var src = STREAMS[relay];
    if (!src) return STREAMS.main.hifi;
    if (src[quality]) return src[quality];
    for (var k in src) { if (src.hasOwnProperty(k)) return src[k]; }
    return STREAMS.main.hifi;
  }

  function syncQualityOptions() {
    if (!relayEl || !qualityEl) return;
    var relay = relayEl.value;
    var src = STREAMS[relay];
    var hasHiFi = src && src.hifi;
    var hasStandard = src && src.standard;
    qualityEl.innerHTML = '';
    if (hasHiFi) {
      var opt = document.createElement('option');
      opt.value = 'hifi';
      opt.textContent = 'HiFi (AAC)';
      qualityEl.appendChild(opt);
    }
    if (hasStandard) {
      var opt2 = document.createElement('option');
      opt2.value = 'standard';
      opt2.textContent = 'Standard (MP3)';
      qualityEl.appendChild(opt2);
    }
    if (!hasStandard && qualityEl.value === 'standard') qualityEl.value = 'hifi';
  }

  var reconnectTimer = null;
  var reconnectAttempts = 0;
  var lastProgress = Date.now();

  function scheduleReconnect() {
    if (!wantPlaying || reconnectTimer || isSwitching) return;
    reconnectAttempts += 1;
    setPlayState('zm-on', 'zm-tuning');
    setSignal('SIGNAL LOST - RETRYING');
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null;
      if (!wantPlaying || isSwitching) return;
      lastProgress = Date.now();
      audio.src = getStreamUrl() + '?t=' + Date.now();
      applyVolume();
      audio.play().catch(function () { scheduleReconnect(); });
    }, Math.min(3000 * reconnectAttempts, 15000));
  }

  function tuneIn() {
    wantPlaying = true;
    isSwitching = false;
    reconnectAttempts = 0;
    lastProgress = Date.now();
    setPlayState('zm-on', 'zm-tuning', 'zm-buffering');
    setSignal('TUNING\u2026');
    audio.src = getStreamUrl() + '?t=' + Date.now();
    applyVolume();
    audio.play().catch(function () {
      wantPlaying = false;
      setPlayState('zm-off');
      setSignal('TAP TO TUNE IN');
      document.addEventListener('pointerdown', function (e) {
        if (!wantPlaying && !(toggleBtn && toggleBtn.contains(e.target)) && !(volumeEl && volumeEl.contains(e.target))) tuneIn();
      }, { once: true });
    });
  }

  function tuneOut() {
    wantPlaying = false;
    isSwitching = false;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    reconnectAttempts = 0;
    setPlayState('zm-off');
    setSignal('RECEIVER OFF');
    audio.pause();
    audio.removeAttribute('src');
  }

  function retune() {
    if (!wantPlaying) return;
    isSwitching = true;
    audio.pause();
    audio.src = getStreamUrl() + '?t=' + Date.now();
    applyVolume();
    lastProgress = Date.now();
    reconnectAttempts = 0;
    setPlayState('zm-on', 'zm-tuning', 'zm-buffering');
    setSignal('TUNING\u2026');
    audio.play().then(function () {
      isSwitching = false;
    }).catch(function () {
      isSwitching = false;
      scheduleReconnect();
    });
  }

  audio.addEventListener('timeupdate', function () { lastProgress = Date.now(); });
  audio.addEventListener('error', scheduleReconnect);
  audio.addEventListener('ended', scheduleReconnect);
  audio.addEventListener('playing', function () {
    if (!wantPlaying) return;
    reconnectAttempts = 0;
    lastProgress = Date.now();
    setPlayState('zm-on', 'zm-receiving', 'zm-streaming');
    setSignal('RECEIVING');
  });
  audio.addEventListener('waiting', function () {
    if (wantPlaying) { setPlayState('zm-on', 'zm-tuning', 'zm-buffering'); setSignal('TUNING\u2026'); }
  });

  setInterval(function () {
    if (!wantPlaying || reconnectTimer || isSwitching) return;
    if (Date.now() - lastProgress > 15000) {
      try { audio.pause(); } catch {}
      scheduleReconnect();
    }
  }, 5000);

  syncQualityOptions();

  toggleBtn && toggleBtn.addEventListener('click', function () { wantPlaying ? tuneOut() : tuneIn(); });
  if (playBtn) playBtn.addEventListener('click', function () { wantPlaying ? tuneOut() : tuneIn(); });
  if (stopBtn) stopBtn.addEventListener('click', function () { wantPlaying && tuneOut(); });

  if (relayEl) {
    relayEl.addEventListener('change', function () {
      syncQualityOptions();
      retune();
    });
  }
  if (qualityEl) qualityEl.addEventListener('change', retune);

  if (prevBtn) prevBtn.addEventListener('click', function () {
    if (!relayEl) return;
    var i = RELAY_ORDER.indexOf(relayEl.value);
    relayEl.value = RELAY_ORDER[(i - 1 + RELAY_ORDER.length) % RELAY_ORDER.length];
    syncQualityOptions();
    retune();
  });

  if (nextBtn) nextBtn.addEventListener('click', function () {
    if (!relayEl) return;
    var i = RELAY_ORDER.indexOf(relayEl.value);
    relayEl.value = RELAY_ORDER[(i + 1) % RELAY_ORDER.length];
    syncQualityOptions();
    retune();
  });

  setPlayState('zm-off');
  setSignal('\u00a0');

  window.ZamRockPlayer = { start: tuneIn, stop: tuneOut, toggle: function () { wantPlaying ? tuneOut() : tuneIn(); }, getRelay: function () { return relayEl ? relayEl.value : null; } };
})();
