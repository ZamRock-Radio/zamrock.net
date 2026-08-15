/* global IntersectionObserver */

let isLoading = false
let lastPostId = null

const buffer = [] // cache fetched posts
const displayCount = 2 // posts shown per click
const prefetchPages = 3 // pages fetched at once (reduced for reliability)
const pageLimit = 3 // posts per API call
const maxRetries = 3
const retryDelay = 1500

function createNewsCard (post) {
  const card = document.createElement('article')
  card.className = 'news-card'

  card.innerHTML = `
    <div class="news-header">
      <img src="${post.account.avatar_static}" alt="" class="avatar" loading="lazy">
      <div>
        <strong>${post.account.display_name || post.account.username}</strong><br>
        <small>${new Date(post.created_at).toLocaleString()}</small>
      </div>
    </div>

    <div class="news-content">
      ${post.content}
    </div>

    ${post.media_attachments.length
? `
      <div class="news-media">
        ${post.media_attachments.map(m =>
          `<img src="${m.preview_url}" loading="lazy">`
        ).join('')}
      </div>
    `
: ''}

    <div class="news-footer">
      <a href="${post.url}" target="_blank" rel="noopener">
        View on Mastodon
      </a>
    </div>
  `

  return card
}

// Language → Mastodon account, matching the regional ZamRock accounts so the
// newsfeed shows posts in the same language as the page (/zh-CN/ → Chinese, etc.)
const NEWS_ACCOUNTS = {
  en: { instance: 'musicworld.social', id: '114289974100154452' },
  es: { instance: 'mastodon.la', id: '116601174957600522' },
  pt: { instance: 'organica.social', id: '116594721906567131' },
  'zh-TW': { instance: 'g0v.social', id: '116606219420725428' },
  'zh-CN': { instance: 'tea.codes', id: '116606231850444878' },
  ar: { instance: 'mastodon.tn', id: '116608436579474898' },
  fr: { instance: 'mastodon.re', id: '116608492501547897' }
}

const NEWS_LANG_ALIASES = {
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hant': 'zh-TW'
}

function getNewsLang () {
  const raw = (document.documentElement.lang || 'en').trim()
  return NEWS_LANG_ALIASES[raw.toLowerCase()] || raw
}

function getNewsAccount () {
  return NEWS_ACCOUNTS[getNewsLang()] || NEWS_ACCOUNTS.en
}

const CF_WORKER = 'https://website-newsfeed.deathsmack-a51.workers.dev/'
const PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url='
]

async function fetchPosts (limit, maxId) {
  const lang = getNewsLang()
  const account = getNewsAccount()
  let api = `statuses?lang=${encodeURIComponent(lang)}&limit=${limit}&exclude_replies=true&exclude_reblogs=true`
  if (maxId) api += `&max_id=${maxId}`

  // Try CF Worker first (direct, no proxy)
  try {
    const res = await fetch(CF_WORKER + api)
    if (!res.ok) throw new Error('CF Worker not ok')
    const data = await res.json()
    if (Array.isArray(data)) return data
  } catch (err) {
    console.warn('CF Worker error:', err.message)
  }

  // Fall back to public proxies
  let apiUrl = `https://${account.instance}/api/v1/accounts/${account.id}/statuses` +
    `?limit=${limit}&exclude_replies=true&exclude_reblogs=true`
  if (maxId) apiUrl += `&max_id=${maxId}`

  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(apiUrl))
      if (res.ok) return res.json()
    } catch {
      console.warn('Proxy failed, trying next...')
    }
  }
  throw new Error('Pound that reload FTW!')
}

async function fetchWithRetry (limit, maxId, retries = maxRetries) {
  for (let i = 0; i < retries; i++) {
    try {
      const posts = await fetchPosts(limit, maxId)
      return posts
    } catch (err) {
      console.warn('Fetch failed, retrying...', i + 1, '/', retries)
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
    }
  }
  throw new Error('Pound that reload FTW!')
}

async function prefetch () {
  if (isLoading) return
  isLoading = true

  try {
    for (let i = 0; i < prefetchPages; i++) {
      const posts = await fetchWithRetry(pageLimit, lastPostId)

      if (!posts.length) {
        document.getElementById('newsContainer').innerHTML = '<div class="no-news">No more posts.</div>'
        document.getElementById('loadMoreNews')?.remove()
        return
      }

      buffer.push(...posts)
      lastPostId = posts[posts.length - 1].id
    }
  } catch (err) {
    console.error(err)
    document.getElementById('newsContainer').innerHTML = `
      <div class="error">
        Failed to load news 😿<br>
        <small>${err.message}</small><br>
        <small>If it persists, visit our <a href="https://musicworld.social/@ZamRock" target="_blank">Mastodon feed</a></small>
      </div>`
  } finally {
    isLoading = false
  }
}

async function displayNext () {
  const container = document.getElementById('newsContainer')
  if (!container) return

  if (container.querySelector('.loading')) {
    container.innerHTML = ''
  }

  if (buffer.length < displayCount * 2) await prefetch()

  for (let i = 0; i < displayCount; i++) {
    const post = buffer.shift()
    if (!post) {
      document.getElementById('loadMoreNews')?.remove()
      return
    }
    container.appendChild(createNewsCard(post))
  }
}

function setupLazyLoad () {
  const container = document.getElementById('newsContainer')
  if (!container) return

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      displayNext()
      observer.disconnect()
    }
  }, {
    rootMargin: '200px'
  })

  observer.observe(container)
}

function addLoadMoreButton () {
  if (document.getElementById('loadMoreNews')) return

  const btn = document.createElement('button')
  btn.id = 'loadMoreNews'
  btn.className = 'btn load-more'
  btn.textContent = 'Load More'
  btn.onclick = displayNext

  document.querySelector('.news-section')?.appendChild(btn)
}

document.addEventListener('DOMContentLoaded', () => {
  setupLazyLoad()
  addLoadMoreButton()
})
