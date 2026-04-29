# Tile Themes

This folder contains swappable tile themes for Silent Ruins.

## Structure

```text
tiles/
├── theme-mapping.toml    # Block-to-tile mappings for each theme
├── kenney-pico-8/        # 150 tiles (8x8 pixel art)
├── kenney-farm/          # 112 tiles (8x8 pixel art)
└── default/              # Reserved for custom theme
```

## Adding a New Theme

1. Create a folder for your theme: `tiles/my-theme/`
2. Add PNG tiles (8x8 pixels each)
3. Add mappings to `theme-mapping.toml`

## Theme Switching

The game will load tiles from the active theme folder based on the mappings in `theme-mapping.toml`.

## Tile Size

All tiles should be 8x8 pixels. The game scales them to `TILE_SIZE` (32px by default) when rendering.
