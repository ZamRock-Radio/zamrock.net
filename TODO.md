# TODO: Fix XDC Player & Site Issues

## Critical Bugs

### 1. XDC Player - Fullscreen Controls (Mobile)
- [ ] Controls don't show in fullscreen on mobile
- [ ] Fix: Ensure gamepad shows as compact overlay in fullscreen for mobile
- [ ] Test: Portrait + landscape fullscreen

### 2. XDC Player - Desktop Controls
- [ ] Desktop shows gamepad controls (should NOT)
- [ ] Fix: Desktop = keyboard only (WASD, arrows, Z/X, Shift/Control, Enter/Escape)
- [ ] Gamepad should only appear on touch/mobile devices

### 3. Debug Overlay
- [ ] Showing on ALL pages (should only be on XDC player page)
- [ ] Fix: Only inject debug overlay on XDC player page

### 4. Nostr Login Player
- [ ] Likes not handled correctly
- [ ] Badges not being awarded
- [ ] Need to debug and fix

### 5. Mobile Layout Issues
- [ ] Portrait: GameBoy style (3/4 ratio, controls bottom) - verify working
- [ ] Landscape: Switch style (controls split sides, game centered) - verify working
- [ ] Game appears tiny - fix viewport/sizing

### 6. Game Loading
- [ ] Game doesn't open after file selection
- [ ] Check console for extraction/storage errors

## Priority Order
1. Remove debug overlay from non-XDC pages
2. Fix desktop = no gamepad (keyboard only)
3. Fix mobile fullscreen gamepad visibility
4. Fix game loading/opening
5. Fix mobile layout sizing
6. Debug Nostr login player likes/badges

## Files to Modify
- `/home/deathsmack/hub/zamrock.net/docs/xdc/index.html` - XDC player page
- `/home/deathsmack/hub/zamrock.net/zola-site/templates/base.html` - Debug overlay location
- `/home/deathsmack/hub/zamrock.net/docs/js/virtual-gamepad.js` - Gamepad logic
- `/home/deathsmack/hub/zamrock.net/docs/js/xdc-player.js` - Game loading
- `/home/deathsmack/hub/zamrock.net/docs/css/xdc-player.css` - Layout CSS