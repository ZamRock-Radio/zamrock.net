# zamrock.net Upgrade TODO

Plan: **Migrate Zola 0.22.1 → 0.23.3 → mockups → UI/layout upgrade → translations**

Rollback safety: Zola 0.22.1 binary backed up on `zola-v1-bak` branch (`tools/zola-0.22.1-x86_64-unknown-linux-gnu`) + local `~/.local/bin/zola-0.22.1.bak`.

## Phase 1 — Zola 0.23.3 Migration (branch: `tera-mig`)

- [x] Backup local binary → `~/.local/bin/zola-0.22.1.bak`
- [x] Download Zola v0.23.3 (official GitHub release) → verify archive
- [x] Swap `{{ i18n::t(key="...") }}` → `{{ trans(key="...") }}` in `zola-site/templates/base.html` + `index.html`
- [x] Delete `zola-site/templates/macros.html` (macros removed in Tera v2)
- [x] `zola build` with 0.23.3 → green build
- [x] Diff `docs/` output vs 0.22.1 build → zero visual change (except intended)
- [x] Verify all 11 language homepages render (`/`, `/es/`, `/pt/`, `/fr/`, `/zh-CN/`, `/zh-TW/`, `/ar/`, `/sv/`, `/ja/`, `/vi/`, `/ko/`)
- [x] Check `trans()` matches previous macro strings (Mega Relay naming, emojis, footer)
- [x] Commit, push `tera-mig`, open PR on Forgejo

## Phase 2 — UI / Layout Upgrade (branch: `crossfade` — ACTIVE)

> **Branch note**: Work moved from `ui-mockups` to `crossfade` (user-approved). `ui-mockups` is frozen at `377112b` (mockup-only). NEVER switch branches without explicit approval.

### Step A — Landing page mockups (branch `ui-mockups`)

- [x] Study reference layouts: `git.zamrock.net` (Forgejo landing) + `icepick.zamrock.net` (product landing)
- [x] Build 6 landing page mockups in `mockups/` (forge, icepick, gallery-crossfade, record-store, nord-terminal, broadcast-console)
- [x] Mockups reuse local `website_bg` pics (not GitHub URLs)
- [x] `mockups/index.html` — nav page linking all mockups
- [x] **Direction chosen: Gallery Crossfade** (rotating art + glass rail) — unique but professional

### Step B — Implement Crossfade theme in Zola

Theme architecture: **multi-theme ready** — every theme is one CSS file + `data-theme` attribute; `themes.js` swaps `<link>` stylesheets + persists in `localStorage`. Adding theme #2 later = drop in one CSS file.

- [x] Crossfade mockup → real theme: `static/css/crossfade.css` + `static/js/crossfade.js` (bg rotation) + `static/js/themes.js` (theme switch plumbing)
- [x] Rewrite `base.html` to crossfade skeleton (bg slideshow, glass rail, nav pills) — keep `trans()` i18n
- [x] Rewrite `index.html` content block: player card (existing IDs: `#radioStream #playButton #volumeSlider`) + news section (`#newsContainer`, `.news-card`)
- [x] Keep player JS (`main.js`) + news JS (`news.js`) working — same element IDs/classes
- [x] Update OG/twitter images → local `website_bg` (stop GitHub URLs)
- [x] Polish EVERY page for crossfade:
  - [x] about, contact, games, news, schedule, help-wanted → crossfade look (convert static → Zola templates where sensible)
  - [x] Responsive/mobile pass for new page components
  - [ ] Clean legacy static/ junk (`old-b`, `Schedual`, `Daily-Planner`, `template.html`, `neon.html`)
- [x] Chat links: **Revolt + Vector primary**, others (Mastodon, Matrix, Bluesky, Telegram, Fluxer, Keybase, Discord) nested behind a "more" toggle — easy to find, out of view. Vector invite updated to `https://vectorapp.io/invite/naddr1...`
- [ ] Review pending remote branches for fold-in: `feature/supporters-page`, `contact-page-telegram`, `feature/game-section`, etc.

### Player / Stream Work

- [x] Wire player to Icepick stream (`https://icepick.zamrock.net/radio.mp3`) — verified 200 `audio/mpeg` + CORS `*`; HEAD 400 harmless (browsers use GET)
- [x] Add volume slider control (wired to `audio.volume`)
- [x] Keep the bulletproof reconnect logic (10-attempt exponential backoff, stall recovery, visibility/online handlers)
- [x] Remove old `streamSelect` probe + `probePre` markup — Icepick is the only stream, no metadata polling
- [x] **Immersive / Now-Playing mode** (`5262cf8`): fold layout to player-only
  - [x] Button **stays top-left** with appropriate padding — NOT centered; minimal, background flows through (transparent rail)
  - [x] Full-width labeled "Hide Menu"/"Show Menu" button (was tiny ⛶ corner icon — too subtle, user reported it "didn't work")
  - [x] Glyph via CSS `::before` so JS swaps the visible label cleanly
  - [x] `body.immersive` hides `.rail > :not(.player)`, `.content`, `.site-footer`; transparent rail so artwork shows
  - [x] State persisted in `localStorage` (`zamrock.immersive`)
  - [x] `fold_layout`/`unfold_layout` translation keys in ALL 11 languages (Zola fails build if any missing)
  - [ ] Verify live on `https://zamrock.net` after next push

### Languages / i18n Work

- [ ] **Language switcher at bottom of rail** — easy to find, alongside/below the nav menu (user request). All 11 languages, links via `get_url(path="@/_index.md", lang=...)`. Highlight current language.
- [ ] **Mastodon news feed must match page language** (user request):
  - [ ] Per-language Mastodon account mapping (7 accounts — see below)
  - [ ] `news.js` picks account by page language (from `<html lang>` or body data attr)
  - [ ] CF Worker `website-newsfeed` needs per-account handling (account ID + instance)
  - [ ] Fallback: languages without a regional account → English flagship
  - Mastodon account map:
    | Lang | Instance | Account |
    |------|----------|---------|
    | en (flagship) | musicworld.social | @ZamRock |
    | es | mastodon.la | @ZamRock |
    | pt | organica.social | @ZamRock |
    | zh-TW | g0v.social | @ZamRock |
    | zh-CN | tea.codes | @ZamRock |
    | ar | mastodon.tn | @ZamRock |
    | fr | mastodon.re | @ZamRock |
    | sv / ja / vi / ko | — | no regional account → fallback to en |
  - [ ] Verify with a live check (e.g. `/zh-CN/` shows Chinese posts)

### Step C — Subpage polish (AFTER Hide Menu fixed)

- [x] Convert all subpages to crossfade Zola templates (about, contact, games, news, schedule, help-wanted)
- [ ] Translate page H1s + subtitles via `trans()` keys (currently hardcoded English in templates)
- [ ] Schedule page: "Now Playing"/"Upcoming Playlists" headings via `trans()` keys
- [ ] Games page: verify `silent-ruins/game.html` path works (exists in `static/games/silent-ruins/`)
- [ ] News page: "View on Mastodon"/"Load More" labels via `trans()` keys
- [ ] **Every page must be translatable** — NO hardcoded English in templates
- [ ] Freeze final English string inventory
- [ ] Add ALL UI strings to `config.toml` `[languages.*.translations]` for all 11 languages
- [ ] Verify each language renders (RTL check for `ar`)

## Phase 3 — Translations

- [ ] Freeze final string inventory from Phase 2
- [ ] Add any new UI strings to `config.toml` `[languages.*.translations]` for all 11 languages
- [ ] Verify each language renders (RTL check for `ar`)
- [ ] Remove leftover hardcoded strings (README GitHub refs, base.html og:image GitHub URLs)

## Chat & Community Focus

- [x] Revolt (`https://stt.gg/CsjKzYWm`) + Vector (`https://vectorapp.io`) as primary, prominent links
- [x] Mastodon, Matrix, Bluesky, Telegram, Fluxer, Keybase, Discord nested in a "more chats" toggle

## Deploy / Mirror

- [ ] Rebuild `zola build` → verify `docs/` output (no `127.0.0.1` URLs, no probe, no stale markup)
- [ ] Push final to Forgejo `origin` (`crossfade` branch)
- [ ] Mirror to `nostr` remote (GitWorkshop)
