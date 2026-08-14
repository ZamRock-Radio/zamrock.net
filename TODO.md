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

### Step A — Landing page mockups (in progress, branch `ui-mockups`)

- [x] Study reference layouts: `git.zamrock.net` (Forgejo landing) + `icepick.zamrock.net` (product landing)
- [ ] Build 6 landing page mockups in `mockups/`:
  - [ ] `forge-landing` — Forgejo-style: dark hero, stat cards, project card grid, CTA
  - [ ] `icepick-landing` — Icepick-style: clean product hero, big stats, feature grid, stack chips
  - [ ] `gallery-crossfade` — rotating website_bg backgrounds with crossfade, floating glass content (bg)
  - [ ] `record-store` — polished current layout: glass record card player, pill nav (bg)
  - [ ] `nord-terminal` — NORAD/WOPR terminal: mono font, signal readouts, scanlines (bg)
  - [ ] `broadcast-console` — studio hardware: status bar, player + now-playing panel, news panel
- [ ] Mockups reuse local `website_bg` pics (not GitHub URLs) — serve from `zola-site/static/img/website_bg/`
- [ ] Upgraded content — NOT a mirror of old pages: hero copy, real stats (35 repos, 6 bots, 13 CF Workers, 3 servers, 24/7), project cards (Icepick, CastileSoap, Icetray, WOPR, H4X, The Catalyst, Matrix-Bridge, Kener, UCANN, Cordovan, Silent Ruins), features, stack chips
- [ ] `mockups/index.html` — nav page linking all mockups for local browsing
- [ ] Pick winner theme (or hybrid) with DeathSmack

### Step B — Implement chosen theme in Zola

- [ ] Choose theme direction (Standard Theme Pack — Tokyo Night etc., or keep Press Start 2P pixel style)
- [ ] Modernize player block (stream selector, volume, play button)
- [ ] Replace static subpage HTML with Zola-rendered templates (about, contact, games, news, schedule, help-wanted)
- [ ] Update OG/twitter images — currently point at abandoned GitHub repo (`raw.githubusercontent.com/DeathSmack/zamrock/...`)
- [ ] Clean legacy static/ junk (`old-b`, `Schedual`, `Daily-Planner`, `template.html`, `neon.html`)
- [ ] Review pending remote branches for fold-in: `feature/supporters-page`, `contact-page-telegram`, `feature/game-section`, etc.
- [ ] Mobile/responsive check

## Phase 3 — Translations

- [ ] Freeze final string inventory from Phase 2
- [ ] Add any new UI strings to `config.toml` `[languages.*.translations]` for all 11 languages
- [ ] Verify each language renders (RTL check for `ar`)
- [ ] Remove leftover hardcoded strings (README GitHub refs, base.html og:image GitHub URLs)

## Deploy / Mirror

- [ ] Push final to Forgejo `origin`
- [ ] Mirror to `nostr` remote (GitWorkshop)