/* Theme loader — swap themes without reload.
 * Each theme is one CSS file in /css/themes/. Add a new theme by:
 *   1. creating /css/themes/<name>.css
 *   2. adding <link data-theme="<name>" href="/css/themes/<name>.css">
 * Persisted choice lives in localStorage["zamrock-theme"].
 */
(function () {
  'use strict'
  const STORAGE_KEY = 'zamrock-theme'
  const links = Array.prototype.slice.call(document.querySelectorAll('link[data-theme]'))
  const current = localStorage.getItem(STORAGE_KEY)
  const selected = links.find((l) => l.dataset.theme === current) ? current : links[0].dataset.theme

  function apply (name) {
    links.forEach((l) => {
      l.disabled = l.dataset.theme !== name
    })
    document.documentElement.dataset.theme = name
  }

  apply(selected)

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-theme-switch]')
    if (!btn) return
    const name = btn.dataset.themeSwitch
    localStorage.setItem(STORAGE_KEY, name)
    apply(name)
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-switch]'), (b) => {
      b.classList.toggle('active', b === btn)
    })
  })
})()
