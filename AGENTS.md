# ZamRock Radio - AGENTS.md

AI agent guidelines for the zamrock.net repository. This is a static HTML/CSS/JS website with Python bots.

## Project Overview

- **Type**: Static website (no build step, no package.json)
- **Structure**: Main site in `docs/`, Python bots in `Bots/`
- **Hosting**: GitHub Pages from `docs/` directory
- **Python**: Discord bot in `Bots/Discord/ls/` using discord.py

## Commands

### Linting

```bash
# JavaScript - ESLint (requires node_modules/ with eslint installed)
eslint .
# or if node_modules/.bin is not in PATH:
./node_modules/.bin/eslint .

# Python - Flake8, Black, isort
flake8
black --check .
isort --check .

# Markdown
# Uses .markdown-lint.yml - run via GitHub super-linter in CI
```

### Formatting

```bash
# Python formatting (auto-fix)
black .
isort .
```

### Build & Test

- **No build command** - static files are served directly
- **No test framework configured** - CI has a placeholder test job:
  ```yaml
  - name: Run Tests
    run: echo "Tests passed - no test suite configured"
  ```
- To run a single test in future: no test runner is set up yet

### CI/CD

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Uses `github/super-linter/slim@v5` for linting
- Sets up FFmpeg for audio processing utilities

## Code Style Guidelines

### JavaScript (`.eslintrc.json`)

- **Quotes**: Single quotes (not double)
- **Semicolons**: Required - always use `;`
- **Spacing**: No space before function parentheses: `function name()` not `function name ()`
- **Trailing commas**: Only in multiline: `comma-dangle: ["error", "only-multiline"]`
- **Variables**: Use `const` and `let` (never `var`)
- **Arrow functions**: Preferred for callbacks: `() => {}`
- **Template literals**: Use backticks for interpolation: `` `url('${var}')` ``
- **Async**: Use `async/await` pattern in newer code (`news.js`)
- **Globals**: Declare browser APIs with comments: `/* global fetch, IntersectionObserver */`
- **Module system**: No ES modules - scripts loaded via `<script>` tags in HTML
- **File naming**: kebab-case (`main.js`, `news.js`, `neon-player.js`)
- **Function/variable naming**: camelCase (`animateTabTitle`, `setRandomBackground`)
- **Environment**: Browser + Node (es2021), configured in `.eslintrc.json`

### Python (`.flake8`, `.python-black`, `.isort.cfg`)

- **Formatter**: Black with line-length=88, target Python 3.7-3.10
- **Linter**: Flake8 with max-line-length=88, max-complexity=10
- **Import sorting**: isort with `multi_line_output=3` (Vertical Hanging Indent), line_length=88
- **Naming**: snake_case for variables and functions
- **Type hints**: Use where practical: `def query_openwebui(prompt: str) -> str`
- **Shebang**: `#!/usr/bin/env python3` at top of executable scripts
- **Comments**: Decorative banners with `# ──────────────────`
- **Config**: Use `.env` file with `python-dotenv` (never commit secrets)
- **Imports order**: Standard library → third-party → local (handled by isort)

### CSS (`docs/css/`)

- **Variables**: Use CSS custom properties in `:root`
- **Theme**: Nord-like dark palette:
  - `--bg-color: #2e3440`
  - `--text-color: #d8dee9`
- **Font**: `'Press Start 2P'` (pixel/retro font from Google Fonts)
- **Preprocessor**: None (zola-site/sass/ directory exists but is empty)
- **Structure**: External stylesheets in `docs/css/`, one file per page when needed
- **Naming**: kebab-case for classes and IDs

### HTML (`docs/`)

- **Tags**: Lowercase tag names
- **IDs/Classes**: kebab-case naming convention
- **Structure**: External CSS in `css/`, external JS in `js/`
- **Meta tags**: Include SEO and Open Graph tags on all pages
- **Template**: Use `docs/template.html` as reference for new pages
- **Scripts**: Load via `<script src="..."></script>` (no module type)

### JSON

- **Config files**: `manifest.json` (browser extension), `liquidsoap-bio.json`
- **Data files**: `Radio-Schedule.json`, `pop-tags.json`
- **Formatting**: Use 2-space indentation

## Git Workflow

Follow hub-level rules at `/home/deathsmack/hub/AGENTS.md`:

- **Branch-only work**: Never commit to `main` or `master`
- **Codeberg primary**: Fetch/push to Codeberg, mirrors to GitHub
- **Sync before branching**: `git checkout main && git pull codeberg main`
- **Push frequently**: Don't let local commits pile up
- **No PR merging**: Only push commits to working branches

### Remotes

```bash
codeberg    git@codeberg:ZamRock-Radio/zamrock.net.git
origin      git@github.com:ZamRock-Radio/zamrock.net.git
```

## Notes

- No `.cursorrules` or `.github/copilot-instructions.md` found in this repo
- No existing AGENTS.md prior to this file
- Hub-level rules at `/home/deathsmack/hub/AGENTS.md` also apply
- Python bots should use venv for deployment (see hub AGENTS.md for details)
- Node modules only contain ESLint tooling (no runtime dependencies)
