// Service Worker for XDC Game File Serving
// Serves extracted XDC files from IndexedDB

const CACHE_NAME = 'xdc-player-v27';
const GAMES_DB = 'xdc-games';
const FILES_STORE = 'files';

// Files to precache (static assets only, NOT HTML pages)
const PRECACHE_URLS = [
  '/css/xdc-player.css?v=27',
  '/js/xdc-player.js?v=27',
  '/js/xdc-extractor.js?v=27',
  '/js/indexeddb-saves.js?v=27',
  '/js/virtual-gamepad.js?v=27',
  '/sw-xdc-v27.js?v=27'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle XDC game file requests: /xdc/{gameId}/{path} (not the main /xdc/ page)
  if (url.pathname.startsWith('/xdc/') && url.pathname !== '/xdc/' && url.pathname !== '/xdc') {
    event.respondWith(handleXDCRequest(event.request, url));
    return;
  }
  
  // For HTML pages (navigation requests), use network-only to avoid stale content
  if (event.request.mode === 'navigate' || 
      (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkOnly(event.request));
    return;
  }
  
  // For static assets, use network-first with cache fallback
  event.respondWith(networkFirst(event.request));
});

async function handleXDCRequest(request, url) {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts = ['xdc', 'gameId', 'path', 'to', 'file']
  
  if (pathParts.length < 3) {
    console.log('SW: pathParts too short:', pathParts);
    return new Response('Not Found', { status: 404 });
  }
  
  const gameId = pathParts[1];
  const filePath = pathParts.slice(2).join('/');
  const dbKey = `${gameId}:${filePath || 'index.html'}`;
  
  console.log('SW handleXDCRequest:', { gameId, filePath, dbKey });
  
  try {
    const fileData = await getFileFromDB(dbKey);
    
    if (!fileData) {
      console.log('SW: file not in DB, trying index.html fallback');
      // Try index.html as fallback
      const indexKey = `${gameId}:index.html`;
      const indexData = await getFileFromDB(indexKey);
      if (indexData) {
        console.log('SW: serving index.html fallback');
        return serveFile(indexData);
      }
      console.log('SW: index.html also not found');
      return new Response('File not found in XDC', { status: 404 });
    }
    
    console.log('SW: serving file:', filePath);
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
      // Don't cache HTML responses
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (err) {
    // Try cache as last resort for offline
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