# t3-plugins

A community collection of themes, wallpaper/artwork assets, and plugins for [T3 Code](https://github.com/pingdotgg/t3code).

## Contents

| Directory | What's inside |
|---|---|
| [`themes/`](./themes/) | The five built-in T3 Code palettes, exported in the same JSON format the app imports/download from Settings → Appearance. Drop one into Settings → Appearance → Import theme. |
| [`wallpapers/`](./wallpapers/) | Background/artwork SVGs shipped with T3 Code (marketing nightly sky, dev and nightly app-icon backgrounds). |
| [`plugins/`](./plugins/) | Plugins, each with a `plugin.json` manifest, drop-in `files/`, an optional host patch, tests, and a demo. |

## Theme format

Theme files follow T3 Code's `ThemeFile` schema (`t3code:themes:v1`):

```json
{
  "version": 1,
  "id": "grove",
  "name": "Grove",
  "appearance": "dark",
  "colors": { "...": "oklch(...)" },
  "variants": { "...": "..." }
}
```

Import via **Settings → Appearance → Import theme**.

## Plugin format (`t3-plugins/v1`)

T3 Code does not yet have a general plugin loader. This repository defines a lightweight, honest packaging convention so plugins are reviewable and installable today:

```json
{
  "schema": "t3-plugins/v1",
  "id": "prompt-library",
  "name": "Prompt Library",
  "version": "1.0.0",
  "kind": "ui-extension",
  "compatibility": { "t3code": ">=0.0.46" },
  "surfaces": ["web", "desktop"],
  "files": {
    "source": "files/",
    "hostPatch": "patches/host-integration.patch",
    "tests": "tests/"
  }
}
```

- `files/` mirrors the destination paths under `apps/web/src/`.
- `patches/` contains the minimal diff needed to wire the plugin into the host app.
- `tests/` holds focused tests; `demo/` holds a runnable walkthrough.

When T3 Code gains a plugin API, these packages can be adapted to load through it without changing their manifests' intent.

## Plugins

- [Prompt Library](./plugins/prompt-library/) — save and reuse common prompts from the sidebar and command palette.

## License

MIT. See [LICENSE](./LICENSE). T3 Code theme and artwork assets remain property of their respective owners in the upstream project; they are included here for community use with attribution to [pingdotgg/t3code](https://github.com/pingdotgg/t3code).
