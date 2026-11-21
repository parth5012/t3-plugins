# Prompt Library — T3 Code plugin

A permanent, reusable prompt library for T3 Code. Save prompts you use again and again, then drop them into any thread from the sidebar or the command palette.

> **Status:** reference implementation. T3 Code does not yet ship a plugin loader, so this package provides drop-in source files plus a patch for the host integration. See [Installation](#installation).

## What it adds

- **Sidebar shelf** at the top of the thread list: `★ Prompt Library (N)`, collapsed by default.
  - `＋` saves the current composer text and opens a name/body editor.
  - Expand to search, click an entry to insert, hover to edit or delete (with confirmation).
- **Command palette** (`⌘K` / `Ctrl+K`):
  - a **Prompt Library** group — type part of a name, press Enter, text lands in the composer.
  - **Save current prompt to library**.
- Insertion is **copy-on-use**: it appends after a blank-line boundary, preserves what is already typed, and never removes the entry.
- Entries are global across projects, stored in `localStorage` under `t3code:prompt-library:v1`. If storage is blocked, the plugin falls back to in-memory for the session and warns you.

This complements the built-in **Prompt Stash** (temporary, one-shot, 20-entry cap). The stash is untouched.

## Installation

From a T3 Code checkout at the same commit this plugin targets:

1. Copy `files/` into `apps/web/src/`, preserving the relative paths:

   ```bash
   cp -r files/prompt-library <t3code>/apps/web/src/
   cp -r files/components/sidebar/* <t3code>/apps/web/src/components/sidebar/
   ```

2. Apply the host integration patch from the repository root:

   ```bash
   cd <t3code>
   git apply /path/to/t3-plugins/plugins/prompt-library/patches/host-integration.patch
   ```

   It adds the shelf and dialog to `Sidebar.tsx` and the command group to `CommandPalette.tsx`.

3. Run `vp install`, then `vp run dev`.

## Tests

The plugin ships the same focused tests used during development:

```bash
vp test run \
  apps/web/src/promptLibraryStore.test.ts \
  apps/web/src/promptLibraryUiStore.test.ts \
  apps/web/src/components/sidebar/PromptLibraryShelf.logic.test.ts \
  --project unit
```

Verified against `pingdotgg/t3code` at `dfbb11bdd`: 18 tests pass, lint clean, `tsc --noEmit` clean.

## Demo

See [`demo/`](./demo/) for a browser-based walkthrough of the save → reload → insert flow.

## Scope / limitations

- Text only — no attachments, folders, tags, or template variables.
- Local to the browser profile — no cross-device sync.
- Web and desktop only; mobile has a separate React Native navigation stack.
