# TODO: Fix XDC Player & Site Issues

## Critical Bugs

### 1. XDC Player - Fullscreen Controls (Mobile)
- [ ] Controls don't show in fullscreen on mobile
- [ ] Fix: Ensure gamepad shows as compact overlay in fullscreen for mobile
- [ ] Test: Portrait + landscape fullscreen

### 2. XDC Player - Desktop Controls
- [x] Desktop shows gamepad controls (should NOT) - FIXED
- [x] Fix: Desktop = keyboard only (WASD, arrows, Z/X, Shift/Control, Enter/Escape) - DONE
- [x] Gamepad should only appear on touch/mobile devices - DONE

### 3. Debug Overlay
- [x] Showing on ALL pages (should only be on XDC player page) - FIXED
- [x] Only inject debug overlay on XDC player page - DONE

### 4. Nostr Login Player (ZamZam)
- [ ] **Leaderboard issues:**
  - [ ] Leaderboard only shows top 10 users with `likes + dislikes >= 2` - users with <2 reactions don't appear
  - [ ] Leaderboard API only returns pubkeys, not names - names only resolved in night report
  - [ ] Account with no name (npub only): likes work but doesn't appear on leaderboard (likely <2 reactions or not top 10)
  - [ ] Account with name: likes not being counted - possible relay propagation issue or cache
- [ ] **Likes not being counted for named account:**
  - [ ] Check if kind-7 events are propagating to queried relays
  - [ ] Check 15-second reactions cache TTL - might be stale
  - [ ] Check if kind-7 events are propagating to the specific relays being queried (RELAYS array)
  - [ ] Add debugging to `/api/leaderboard` to see what's being returned
- [ ] **Badges not being awarded:**
  - [ ] Check badge award logic in `maybeAward` and `awardBadgesForUser`
  - [ ] Check if `STATION_NSEC` is set in worker secrets
  - [ ] Check `AUTO_MAX_TIER` cap (currently 4)

### 5. Mobile Layout Issues
- [ ] Portrait: GameBoy style (3/4 ratio, controls bottom) - verify working
- [ ] Landscape: Switch style (controls split sides, game centered) - verify working
- [ ] Game appears tiny - fix viewport/sizing

### 6. XDC Player - Game Loading
- [ ] Game doesn't open after file selection
- [ ] Check console for extraction/storage errors

### 6. GED Report Counter
- [x] "Read — times by — people" showing dashes instead of numbers - FIXED (now shows "Read 2,725 times by 2,259 people")
- [ ] Check `ged-view-counter.deathsmack-a51.workers.dev` worker - was down/misconfigured
- [ ] Check `/ged/` page JavaScript that fetches from counter worker

### 7. Landing Page Issues
- [ ] Background images returning 404 (website_bg_090.jpg through website_bg_097.jpg)
- [ ] Cloudflare insights beacon returning 503
- [ ] Background images likely need to be served from correct path or Media-Assets repo

### 8. ZamZam Nostr Player
- [ ] Likes not being counted for accounts with names
- [ ] Leaderboard filter `likes + dislikes >= 2` excludes users with <2 reactions
- [ ] Cache TTL (15s) might be too aggressive

## Priority Order
1. Remove debug overlay from non-XDC pages (DONE)
2. Fix desktop = no gamepad (keyboard only) (DONE)
3. Fix mobile fullscreen gamepad visibility (DONE)
4. Fix game loading/opening
5. Fix mobile layout sizing
6. Fix background images 404 on landing page
7. Fix Nostr login player likes/badges
8. Fix GED counter (DONE)
9. Fix ZamZam leaderboard

## Files to Modify
- `/home/deathsmack/hub/zamrock.net/docs/xdc/index.html` - XDC player page
- `/home/deathsmack/hub/zamrock.net/zola-site/templates/base.html` - Debug overlay location
- `/home/deathsmack/hub/zamrock.net/docs/js/virtual-gamepad.js` - Gamepad logic
- `/home/deathsmack/hub/zamrock.net/docs/js/xdc-player.js` - Game loading
- `/home/deathsmack/hub/zamrock.net/docs/css/xdc-player.css` - Layout CSS
- `/home/deathsmack/hub/nostr-radio-app/src/index.js` - ZamZam worker (leaderboard, likes, badges)
- `/home/deathsmack/hub/nostr-radio-app/src/player.html` - ZamZam player UI (likes publishing)
- `/home/deathsmack/hub/zamrock.net/docs/ged/index.html` - GED counter
- `/home/deathsmack/hub/zamrock.net/zola-site/templates/ged.html` - GED template
- `/home/deathsmack/hub/zamrock.net/zola-site/templates/base.html` - Landing page background images