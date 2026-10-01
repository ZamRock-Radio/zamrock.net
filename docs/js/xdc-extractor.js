// XDC Extractor - Handles .xdc file extraction using JSZip
// Loads JSZip from CDN

let JSZip = null;

async function loadJSZip() {
  if (JSZip) return JSZip;
  
  // Try to load from CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  script.crossOrigin = 'anonymous';
  
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  
  JSZip = window.JSZip;
  return JSZip;
}

export class XDCExtractor {
  constructor() {
    this.cache = new Map();
  }

  async extract(file) {
    const JSZipLib = await loadJSZip();
    
    // Generate game ID from file hash
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const gameId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    
    // Check cache
    if (this.cache.has(gameId)) {
      return this.cache.get(gameId);
    }
    
    // Extract zip
    const zip = await JSZipLib.loadAsync(arrayBuffer);
    const files = {};
    
    for (const [path, entry] of Object.entries(zip.files)) {
      if (!entry.dir) {
        const content = await entry.async('uint8array');
        files[path] = content;
      }
    }
    
    // Parse manifest.toml
    let manifest = { name: 'Unnamed Game', version: '1.0.0' };
    if (files['manifest.toml']) {
      manifest = this.parseManifest(new TextDecoder().decode(files['manifest.toml']));
    }
    
    // Store in cache for service worker
    const result = {
      gameId,
      manifest,
      files,
      entryPoint: files['index.html'] ? 'index.html' : Object.keys(files)[0]
    };
    
    this.cache.set(gameId, result);
    
    // Also store in IndexedDB for service worker access
    await this.storeForServiceWorker(gameId, files);
    
    return result;
  }

  parseManifest(tomlText) {
    const manifest = {};
    const lines = tomlText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        manifest[key] = value;
      }
    }
    
    return manifest;
  }

  async storeForServiceWorker(gameId, files) {
    // Store files in IndexedDB for service worker to serve
    const dbName = 'xdc-games';
    const storeName = 'files';
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Store each file
        for (const [path, content] of Object.entries(files)) {
          store.put({
            id: `${gameId}:${path}`,
            gameId,
            path,
            content,
            mimeType: this.getMimeType(path)
          });
        }
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  getMimeType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const types = {
      html: 'text/html',
      htm: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      mjs: 'application/javascript',
      json: 'application/json',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      ogg: 'audio/ogg',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      webm: 'video/webm',
      mp4: 'video/mp4',
      wasm: 'application/wasm',
      txt: 'text/plain',
      md: 'text/markdown',
      toml: 'text/plain'
    };
    return types[ext] || 'application/octet-stream';
  }

  getCachedGame(gameId) {
    return this.cache.get(gameId);
  }
}