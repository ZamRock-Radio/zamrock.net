// Service Worker for XDC Game File Serving
// Serves extracted XDC files from IndexedDB

const CACHE_NAME = 'xdc-player-v1';
const GAMES_DB = 'xdc-games';
const FILES_STORE = 'files';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/xdc/',
        '/css/xdc-player.css',
        '/js/xdc-player.js',
        '/js/xdc-extractor.js',
        '/js/indexeddb-saves.js',
        '/js/virtual-gamepad.js'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle XDC game file requests: /xdc/{gameId}/{path}
  // But NOT the main /xdc/ page (let it pass through to network)
  if (url.pathname.startsWith('/xdc/') && url.pathname !== '/xdc/' && url.pathname !== '/xdc/index.html') {
    event.respondWith(handleXDCRequest(event.request, url));
    return;
  }
  
  // Default: network first, fallback to cache
  event.respondWith(networkFirst(event.request));
});

async function handleXDCRequest(request, url) {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts = ['xdc', 'gameId', 'path', 'to', 'file']
  
  if (pathParts.length < 3) {
    return new Response('Not Found', { status: 404 });
  }
  
  const gameId = pathParts[1];
  const filePath = pathParts.slice(2).join('/');
  const dbKey = `${gameId}:${filePath || 'index.html'}`;
  
  try {
    const fileData = await getFileFromDB(dbKey);
    
    if (!fileData) {
      // Try index.html as fallback
      const indexKey = `${gameId}:index.html`;
      const indexData = await getFileFromDB(indexKey);
      if (indexData) {
        return serveFile(indexData);
      }
      return new Response('File not found in XDC', { status: 404 });
    }
    
    return serveFile(fileData);
  } catch (err) {
    console.error('XDC SW Error:', err);
    return new Response('Internal Error', { status: 500 });
  }
}

function getFileFromDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(GAMES_DB, 1);
    
    request.onupgradeneeded = () => {
      // Database should already exist from main thread
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(FILES_STORE, 'readonly');
      const store = transaction.objectStore(FILES_STORE);
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

function serveFile(fileData) {
  const { content, mimeType } = fileData;
  const body = content instanceof Uint8Array ? content : new Uint8Array(content);
  
  return new Response(body, {
    headers: {
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Length': body.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

// Handle messages from main thread (for debugging)
self.addEventListener('message', (event) => {
  if (event.data.type === 'xdc-debug') {
    console.log('XDC SW Debug:', event.data);
  }
});