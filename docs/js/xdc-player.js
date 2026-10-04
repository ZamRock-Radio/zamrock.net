// XDC Player - Main Module
import { XDCExtractor } from './xdc-extractor.js';
import { IndexedDBSaves } from './indexeddb-saves.js';
import { VirtualGamepad } from './virtual-gamepad.js';

class XDCPlayer {
  constructor() {
    this.extractor = new XDCExtractor();
    this.saves = new IndexedDBSaves();
    this.gamepad = null;
    this.currentGameId = null;
    this.currentManifest = null;
    this.gameFrame = document.getElementById('gameFrame');
    this.gameTitle = document.getElementById('gameTitle');
    this.saveStatus = document.getElementById('saveStatus');
    this.uploadSection = document.querySelector('.xdc-upload-section');
    this.gameSection = document.getElementById('gameSection');
    
    this.supportsFileSystemAccess = 'showOpenFilePicker' in window;
    this.isAndroid = /Android/i.test(navigator.userAgent);
    this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    this.initEventListeners();
    this.registerServiceWorker();
    this.setupAndroidFileHandling();
  }

  initEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('xdcFileInput');
    const browseBtn = document.getElementById('browseBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const launchBtn = document.getElementById('launchBtn');
    
    // Drag and drop (desktop)
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && this.isValidXDC(file)) {
        this.handleFileSelect(file);
      } else if (file) {
        this.showStatus('error', 'Please select a .xdc file');
      }
    });
    
    // Click to browse - use modern API on Android/mobile
    uploadArea.addEventListener('click', (e) => {
      if (e.target === uploadArea || e.target.classList.contains('upload-icon') || 
          e.target.classList.contains('upload-text') || e.target.classList.contains('upload-hint')) {
        this.openFilePicker();
      }
    });
    
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openFilePicker();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFileSelect(file);
    });
    
    removeFileBtn.addEventListener('click', () => this.resetUpload());
    launchBtn.addEventListener('click', () => this.launchGame());
    
    // Game controls
    document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
    document.getElementById('loadBtn').addEventListener('click', () => this.loadGame());
    document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('closeGameBtn').addEventListener('click', () => this.closeGame());
    
    // Listen for messages from game iframe
    window.addEventListener('message', (e) => this.handleGameMessage(e));
    
    // Handle paste (for dragging files from file managers)
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && this.isValidXDC(file)) {
            this.handleFileSelect(file);
            break;
          }
        }
      }
    });
  }

  setupAndroidFileHandling() {
    // On Android, add a long-press handler for the upload area
    if (this.isAndroid) {
      let pressTimer;
      const uploadArea = document.getElementById('uploadArea');
      
      uploadArea.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
          this.openFilePicker();
        }, 500);
      }, { passive: true });
      
      uploadArea.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });
      
      uploadArea.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
      });
    }
  }

  async openFilePicker() {
    const fileInput = document.getElementById('xdcFileInput');
    
    // Try File System Access API first (Chrome on Android, Desktop)
    if (this.supportsFileSystemAccess) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'WebXDC Games',
            accept: {
              'application/zip': ['.xdc'],
              'application/x-xdc': ['.xdc']
            }
          }],
          multiple: false
        });
        
        const file = await handle.getFile();
        if (this.isValidXDC(file)) {
          this.handleFileSelect(file);
          return;
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('File System Access API failed:', err);
        }
        // Fall through to file input
      }
    }
    
    // Fallback: standard file input
    fileInput.value = ''; // Reset to allow same file re-selection
    fileInput.click();
  }

  isValidXDC(file) {
    return file.name.toLowerCase().endsWith('.xdc') || 
           file.type === 'application/zip' ||
           file.type === 'application/x-xdc';
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw-xdc-v17.js', { scope: '/' });
        console.log('XDC Service Worker registered');
      } catch (err) {
        console.warn('SW registration failed:', err);
      }
    }
  }

  async handleFileSelect(file) {
    this.showStatus('info', `Reading ${file.name}...`);
    
    try {
      const result = await this.extractor.extract(file);
      this.currentGameId = result.gameId;
      this.currentManifest = result.manifest;
      
      document.getElementById('fileName').textContent = file.name;
      document.getElementById('fileSize').textContent = this.formatBytes(file.size);
      document.getElementById('fileInfo').classList.remove('hidden');
      document.getElementById('launchBtn').disabled = false;
      document.getElementById('launchBtn').classList.remove('hidden');
      document.getElementById('uploadArea').classList.add('hidden');
      
      this.showStatus('success', `Ready: ${result.manifest.name || 'Unnamed Game'}`);
    } catch (err) {
      this.showStatus('error', `Failed: ${err.message}`);
    }
  }

  resetUpload() {
    document.getElementById('xdcFileInput').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('launchBtn').classList.add('hidden');
    document.getElementById('launchBtn').disabled = true;
    document.getElementById('uploadArea').classList.remove('hidden');
    this.currentGameId = null;
    this.currentManifest = null;
    this.hideStatus();
  }

  async launchGame() {
    if (!this.currentGameId) return;
    
    this.showStatus('info', 'Launching game...');
    
    // Hide upload, show game
    this.uploadSection.style.display = 'none';
    this.gameSection.classList.remove('hidden');
    
    // Set game title
    this.gameTitle.textContent = this.currentManifest?.name || 'XDC Game';
    
    // Initialize virtual gamepad
    this.gamepad = new VirtualGamepad(
      document.getElementById('virtualGamepad'),
      this.gameFrame,
      {
        layout: localStorage.getItem('xdc-gamepad-layout') || 'dpad',
        showOnFullscreen: true
      }
    );
    
    // Load game in iframe via service worker
    const gameUrl = `/xdc/${this.currentGameId}/index.html`;
    this.gameFrame.src = gameUrl;
    
    // Wait for iframe to load
    await new Promise(resolve => {
      this.gameFrame.onload = resolve;
    });
    
    // Enable save/load buttons
    document.getElementById('saveBtn').disabled = false;
    document.getElementById('loadBtn').disabled = false;
    
    // Try auto-load previous save
    const hasSave = await this.saves.hasSave(this.currentGameId);
    if (hasSave) {
      this.showStatus('info', 'Previous save found. Click Load to restore.');
    }
    
    this.hideStatus();
  }

  async saveGame() {
    if (!this.currentGameId) return;
    
    this.showStatus('info', 'Requesting save from game...');
    
    // Ask game for its state
    this.gameFrame.contentWindow.postMessage({
      type: 'xdc-save-request'
    }, '*');
    
    // Wait for response (with timeout)
    const savePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Save timeout')), 5000);
      const handler = (e) => {
        if (e.data.type === 'xdc-save-response') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(e.data.state);
        }
      };
      window.addEventListener('message', handler);
    });
    
    try {
      const state = await savePromise;
      await this.saves.save(this.currentGameId, state, this.currentManifest);
      this.showStatus('success', 'Game saved successfully!');
    } catch (err) {
      this.showStatus('error', `Save failed: ${err.message}`);
    }
  }

  async loadGame() {
    if (!this.currentGameId) return;
    
    this.showStatus('info', 'Loading save...');
    
    try {
      const state = await this.saves.load(this.currentGameId);
      if (!state) {
        this.showStatus('error', 'No save found');
        return;
      }
      
      // Send state to game
      this.gameFrame.contentWindow.postMessage({
        type: 'xdc-load-state',
        state: state
      }, '*');
      
      this.showStatus('success', 'Game loaded!');
    } catch (err) {
      this.showStatus('error', `Load failed: ${err.message}`);
    }
  }

  handleGameMessage(event) {
    if (!event.data || !event.data.type) return;
    
    switch (event.data.type) {
      case 'xdc-save-response':
        // Handled by promise in saveGame()
        break;
      case 'xdc-game-ready':
        console.log('Game ready:', event.data);
        break;
      case 'xdc-set-title':
        this.gameTitle.textContent = event.data.title;
        break;
    }
  }

  toggleFullscreen() {
    const gameWrapper = document.querySelector('.game-wrapper');
    console.log('toggleFullscreen called, fullscreenElement:', document.fullscreenElement);
    if (!document.fullscreenElement) {
      console.log('Requesting fullscreen on gameWrapper');
      gameWrapper.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      console.log('Exiting fullscreen');
      document.exitFullscreen();
    }
  }

  closeGame() {
    this.gameFrame.src = 'about:blank';
    this.gameSection.classList.add('hidden');
    this.uploadSection.style.display = 'block';
    document.getElementById('xdc-upload').classList.remove('hidden');
    this.resetUpload();
    if (this.gamepad) {
      this.gamepad.destroy();
      this.gamepad = null;
    }
  }

  showStatus(type, message) {
    this.saveStatus.textContent = message;
    this.saveStatus.className = `save-status ${type}`;
    this.saveStatus.classList.remove('hidden');
  }

  hideStatus() {
    setTimeout(() => {
      this.saveStatus.classList.add('hidden');
    }, 3000);
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new XDCPlayer();
});

export { XDCPlayer };