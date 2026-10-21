# dsh-client-ui-mobile

[中文](README.zh.md) · [![test](https://github.com/MARYCOMPLEX/dsh-client-ui-mobile/actions/workflows/test.yml/badge.svg)](https://github.com/MARYCOMPLEX/dsh-client-ui-mobile/actions/workflows/test.yml)

Mobile adaptation for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) **Web GUI**, packaged as a standard DSH client plugin.

The Web shell is desktop-first: a three-column frame with drag handles, hover affordances and 8px resize targets. On a phone it technically renders, but the conversation is squeezed next to a 56px rail and the composer fights the on-screen keyboard. This plugin turns the same URL into a usable phone interface — no fork, no patch to the shell, no build step.

> Community plugin, not affiliated with DeepSeek. Built and tested against `@deepseek-ai/dsh` `0.2.1-rc.2`.

## What it does

Everything below applies at **≤ 768px viewport width**; wider viewports are left untouched.

| Area | Behaviour |
| --- | --- |
| Frame | Three columns collapse to one; the centre gets the full width |
| Sidebar | Becomes an overlay drawer (`min(86vw, 300px)`) with a dimmed backdrop; tapping a session, a panel or the backdrop closes it |
| Bottom bar | 56px navigation: **Chat / Sessions / Plugins** (hidden when the Plugins panel is not registered) **/ Desktop** |
| Desktop handles | The 8px `col-resize` handles are hidden — they are not touch targets |
| Right panel | Forced full-screen instead of a docked column |
| Composer | 16px inputs so iOS does not zoom on focus; the frame shrinks by the on-screen keyboard height via `visualViewport` |
| Layout | `100dvh` heights, `env(safe-area-inset-*)` padding for notches and gesture bars |
| Wide content | `pre` and `table` scroll inside their own box instead of widening the page |

## Install

### As a bundle (recommended)

```bash
dsh plugin --profile web add github:MARYCOMPLEX/dsh-client-ui-mobile
```

Then open **Settings → Plugins** and enable the `mobile-ui` bundle. Enabling a bundle appends its patch layer, which inserts the loader row for you.

Pin a release for reproducibility:

```bash
dsh plugin --profile web add "github:MARYCOMPLEX/dsh-client-ui-mobile#v0.1.0"
```

If your profile runs with configuration HMR disabled, restart `dsh web` afterwards.

### As a plain row

If you would rather not adopt the bundle, install the package and add the row yourself:

```yaml
# <profile>/cordis.patch.yml
- insert:
    - id: mobile-ui
      name: "dsh-client-ui-mobile"
```

Either way the package must be installed in the profile (`dsh plugin --profile <name> add …`) so the loader can resolve `dsh-client-ui-mobile` from the profile's `node_modules`.

## The switch

The adaptive layout is **on by default** and can be turned off without uninstalling anything:

- **Desktop** button at the right end of the bar — turns the phone layout off for this browser; the bar disappears and a small **Mobile** pill stays in the bottom-right corner to turn it back on.
- The choice is stored in `localStorage` under `dsh-client-ui-mobile.enabled` (`"1"` / `"0"`).
- URL escape hatch: `?dshm=off` and `?dshm=on` force the state and remember it. Use this if the adaptive layout itself ever makes a page hard to operate.
- Disabling the whole plugin — **Settings → Plugins**, or remove the loader row — leaves the GUI exactly as shipped.

## How it works

A DSH client plugin runs in the same browser runtime as the shell, so it can extend the interface through documented seams only:

1. **Global stylesheet** — `ctx.effect` appends a `<style>` element to `document.head` and removes it on unload, the same mechanism `dsh-client-ui-theme` uses. Every rule is inside a media query and scoped to the frame the plugin tags, so the desktop layout is never affected by a partial mount.
2. **`shell.bottom` slot** — the bar and the pill are ordinary React components registered into the frame's bottom row, so the bar participates in the frame's own grid instead of overlaying content.
3. **`ctx.layout`** — the bar reads `panelInfo` to highlight the active panel and calls `toggleSidebar()` / `selectPanel()` for navigation.
4. **DOM tagging, not class names** — the plugin marks the frame and its three columns with `data-dshm-*` attributes, because the shell's CSS-module class names are hashed per build (`pI_x6G_frame`).

### Maintainer note: the grid trap

The drawer leaves normal flow (`position: fixed`). A CSS grid skips out-of-flow items during auto-placement, so without explicit pins the centre column slides into the first track — which is `0px` wide — and the whole conversation disappears. The plugin pins all three columns:

```css
[data-dshm-frame] > [data-dshm-col="sidebar"]  { grid-column: 1; grid-row: 1 }
[data-dshm-frame] > [data-dshm-col="center"]   { grid-column: 2; grid-row: 1; min-width: 0 }
[data-dshm-frame] > [data-dshm-col="rightbar"] { grid-column: 3; grid-row: 1; min-width: 0 }
```

The smoke test asserts this, so a future refactor cannot silently reintroduce a black screen.

## Compatibility and limitations

- Targets DSH `0.2.x`. The shell's breakpoints, slot names and `ctx.layout` surface are stable within a minor line, but a new release can still move things underneath.
- No hashed class names are used; hooks are `data-shell-bottom`, `data-sidebar-collapsed`, `data-rightbar-col`, `data-sidebar-right-open`, plus the `_handle` class suffix.
- 768px is the plugin's own breakpoint. The shell's right-panel auto-fullscreen switches at `< 768`, so the plugin adds a CSS full-screen fallback for the exact boundary.
- A plugin can change styles, slots and layout state — it cannot change component internals. Composer behaviour (Enter to send, native gestures) stays whatever the shell ships.
- Tested on Android Chrome. iOS Safari support (safe areas, visual-viewport keyboard inset) is implemented but not verified on a physical device; reports welcome.

## Development

No build step and no dependencies — `lib/client.js` is the shipped browser bundle, written against the `window.__ModuleLoader__` contract.

```bash
node test/smoke.mjs
```

The smoke test stubs React, the DOM and the cordis context, then asserts: module registration, stylesheet injection, `shell.bottom` registration, button set and copy, and the column pinning described above.

## License

[MIT](LICENSE)
