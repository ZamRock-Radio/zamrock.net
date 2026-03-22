# Silent Ruins Update Guide

## Quick Update Steps

### 1. Extract XDC
```bash
cd /home/deathsmack/hub/Silent-Ruins
unzip -o silent-ruins-vX.X.XXX-DEV.xdc -d 1.XXX-extract
```

### 2. Copy to Zamrock
```bash
cp 1.XXX-extract/index.html /home/deathsmack/hub/zamrock.net/docs/games/silent-ruins/game.html
rm -rf /home/deathsmack/hub/zamrock.net/docs/games/silent-ruins/assets/audio
rm -rf /home/deathsmack/hub/zamrock.net/docs/games/silent-ruins/assets/graphics
cp -r 1.XXX-extract/assets/* /home/deathsmack/hub/zamrock.net/docs/games/silent-ruins/assets/
```

### 3. Update Version in index.html
```html
<span>Site v0.0.X | Game v0.X.XXX</span>
```

### 4. FIX CANVAS (REQUIRED)
Replace around line 319:
```javascript
canvas.width = 800;
canvas.height = 600;
```
With:
```javascript
canvas.width = 1200;
canvas.height = 900;

function resizeGame() {
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

### 5. Push
```bash
cd /home/deathsmack/hub/zamrock.net
git checkout -b silent-ruins_vX.X.XXX
git add -A && git commit -m "vX.X.XXX" && git push origin silent-ruins_vX.X.XXX
```

---

*Last Updated: 2026-03-22*
*Game Version: v0.1.150-DEV*
