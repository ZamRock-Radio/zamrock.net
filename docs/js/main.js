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
