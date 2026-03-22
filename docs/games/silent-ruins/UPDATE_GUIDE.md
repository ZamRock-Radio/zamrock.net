# Silent Ruins Game Update Guide

## Overview
This document explains how to upgrade Silent Ruins to a new version from the Silent-Ruins repo.

---

## Step 1: Copy New Game Files

From the Silent-Ruins repo directory:
```bash
cd /home/deathsmack/hub/Silent-Ruins
```

Copy the main game file:
```bash
cp index.html /path/to/zamrock.net/docs/games/silent-ruins/game.html
```

Copy manifest:
```bash
cp manifest.toml /path/to/zamrock.net/docs/games/silent-ruins/manifest.toml
```

---

## Step 2: Copy New Assets

Delete old audio/graphics folders and copy fresh:
```bash
rm -rf /path/to/zamrock.net/docs/games/silent-ruins/assets/audio
rm -rf /path/to/zamrock.net/docs/games/silent-ruins/assets/graphics

cp -r assets/audio /path/to/zamrock.net/docs/games/silent-ruins/assets/
cp -r assets/graphics /path/to/zamrock.net/docs/games/silent-ruins/assets/
```

---

## Step 3: Check for New Embed Images

If new SEO embed images were added to Silent-Ruins:
```bash
cp /path/to/Silent-Ruins/assets/graphics/app/embed-seo_*.png /path/to/zamrock.net/docs/games/silent-ruins/assets/graphics/app/
```

---

## Step 4: Update Version Numbers

### In game.html
Copy the version from Silent-Ruins:
```bash
grep "GAME_VERSION" /path/to/Silent-Ruins/index.html | head -1
```

### In index.html (wrapper)
Update the version display line (around line 220):
```html
<span>Site v0.0.X | Game v0.X.XXX</span>
```

---

## Step 5: FIX CANVAS SIZING (IMPORTANT)

The Silent-Ruins repo does NOT include canvas resize code. You MUST add it from the games-section branch.

### Find and replace the canvas sizing section (around line 319 in game.html)

**OLD code from Silent-Ruins:**
```javascript
canvas.width = 800;
canvas.height = 600;
```

**REPLACE WITH (from games-section):**
```javascript
canvas.width = 1200;
canvas.height = 900;

function resizeGame() {
    const container = document.getElementById('gameContainer');
    const aspect = 4 / 3;
    canvas.width = 1200;
    canvas.height = Math.round(1200 / aspect);
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
}

window.addEventListener('message', (e) => {
    if (e.data === 'resizeFullscreen') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else if (e.data === 'resizeNormal') {
        resizeGame();
    }
});

resizeGame();
```

This ensures the canvas fills the container properly in normal mode.

---

## Step 6: Update SEO Metadata

If you added a new embed image:
1. Copy the image to `docs/games/silent-ruins/assets/graphics/app/embed-seo_001.png`
2. Update all `og:image` and `twitter:image` references in `index.html` to point to the new image

---

## Step 7: Commit and Push

```bash
git add -A
git commit -m "Update Silent Ruins to v0.X.XXX-DEV"
git push origin update-game-to-0.1.XXX
```

---

## Step 8: Create PR and Merge

1. Create pull request on GitHub
2. Review changes
3. Merge to main
4. Verify deployment

---

## Troubleshooting

### Canvas too small / empty space on sides
- This is almost always the canvas resize code missing (see Step 5)
- Always verify the resize function is present after copying files

### Game shows old version
- Check the wrapper `index.html` version string (Step 4)
- Check `game.html` title tag

### Missing audio/sounds
- Re-copy the assets folder (Step 2)
- Verify files exist: `ls assets/audio/player/`

### SEO not updating
- Clear browser cache (Ctrl+Shift+R)
- Verify new image is committed: `git log --stat`

---

## Branches

- `main-pre-update-2026-03-21` - Backup of main before this update
- `update-game-to-0.1.149` - This update's working branch
- `games-section` - Contains working canvas code (do not modify)

---

*Last Updated: 2026-03-21*
*Game Version: v0.1.149-DEV*
