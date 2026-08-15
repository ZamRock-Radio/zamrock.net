# zamrock.net Upgrade TODO

Plan: **Migrate Zola 0.22.1 → 0.23.3 → mockups → UI/layout upgrade → translations**

Rollback safety: Zola 0.22.1 binary backed up on `zola-v1-bak` branch (`tools/zola-0.22.1-x86_64-unknown-linux-gnu`) + local `~/.local/bin/zola-0.22.1.bak`.

## Phase 1 — Zola 0.23.3 Migration (branch: `tera-mig`)

- [ ] Backup local binary → `~/.local/bin/zola-0.22.1.bak`
- [ ] Download Zola v0.23.3 (official GitHub release) → verify archive
- [ ] Swap `{{ i18n::t(key="...") }}` → `{{ trans(key="...") }}` in `zola-site/templates/base.html` + `index.html`
- [ ] Delete `zola-site/templates/macros.html` (macros removed in Tera v2)
- [ ] `zola build` with 0.23.3 → green build
- [ ] Diff `docs/` output vs 0.22.1 build → zero visual change (except intended)
- [ ] Verify all 11 language homepages render (`/`, `/es/`, `/pt/`, `/fr/`, `/zh-CN/`, `/zh-TW/`, `/ar/`, `/sv/`, `/ja/`, `/vi/`, `/ko/`)
- [ ] Check `trans()` matches previous macro strings (Mega Relay naming, emojis, footer)
- [ ] Commit, push `tera-mig`, open PR on Forgejo

## Phase 2 — UI / Layout Upgrade (branch: `ui-mockups`, forked from `tera-mig`)

### Step A — Landing page mockups (branch `ui-mockups`)

- [x] Study reference layouts: `git.zamrock.net` (Forgejo landing) + `icepick.zamrock.net` (product landing)
- [x] Build 6 landing page mockups in `mockups/` (forge, icepick, gallery-crossfade, record-store, nord-terminal, broadcast-console)
- [x] Mockups reuse local `website_bg` pics (not GitHub URLs)
- [x] `mockups/index.html` — nav page linking all mockups
- [x] **Direction chosen: Gallery Crossfade** (rotating art + glass rail) — unique but professional

### Step B — Implement Crossfade theme in Zola (current focus, branch `ui-mockups`)

Theme architecture: **multi-theme ready** — every theme is one CSS file + `data-theme` attribute; `themes.js` swaps `<link>` stylesheets + persists in `localStorage`. Adding theme #2 later = drop in one CSS file.

- [x] Crossfade mockup → real theme: `static/css/crossfade.css` + `static/js/crossfade.js` (bg rotation) + `static/js/themes.js` (theme switch plumbing)
- [ ] Rewrite `base.html` to crossfade skeleton (bg slideshow, glass rail, nav pills) — keep `trans()` i18n
- [ ] Rewrite `index.html` content block: player card (existing IDs: `#radioStream #playButton #volumeSlider #streamSelect`) + news section (`#newsContainer`, `.news-card`)
- [ ] Keep player JS (`main.js`) + news JS (`news.js`) working — same element IDs/classes
- [ ] Update OG/twitter images → local `website_bg` (stop GitHub URLs)
- [ ] Polish EVERY page for crossfade:
  - [ ] about, contact, games, news, schedule, help-wanted → crossfade look (convert static → Zola templates where sensible)
  - [ ] Responsive/mobile pass
  - [ ] Clean legacy static/ junk (`old-b`, `Schedual`, `Daily-Planner`, `template.html`, `neon.html`)
- [ ] Chat links: **Revolt + Vector primary**, others (Mastodon, Matrix, Bluesky, Telegram, Fluxer, Keybase, Discord) nested behind a "more" toggle — easy to find, out of view
- [ ] Review pending remote branches for fold-in: `feature/supporters-page`, `contact-page-telegram`, `feature/game-section`, etc.

### Step C — Translations (after English polish is done)

- [ ] Freeze final English string inventory from Steps A/B
- [ ] Update `config.toml` `[languages.*.translations]` for all 11 languages
- [ ] Convert each page's content per-language (start with EN, then all langs)
- [ ] Verify each language renders (RTL check for `ar`)

## Phase 3 — Translations

- [ ] Freeze final string inventory from Phase 2
- [ ] Add any new UI strings to `config.toml` `[languages.*.translations]` for all 11 languages
- [ ] Verify each language renders (RTL check for `ar`)
- [ ] Remove leftover hardcoded strings (README GitHub refs, base.html og:image GitHub URLs)

## Chat & Community Focus

- [ ] Revolt (`https://stt.gg/CsjKzYWm`) + Vector (`https://vectorapp.io`) as primary, prominent links
- [ ] Mastodon, Matrix, Bluesky, Telegram, Fluxer, Keybase, Discord nested in a "more chats" toggle

## Deploy / Mirror

- [ ] Push final to Forgejo `origin`
- [ ] Mirror to `nostr` remote (GitWorkshop)