# Demo

`prompt-library-demo.mp4` (and its `.gif` preview) walks through the full flow:

1. Type a prompt in the composer.
2. Save it with `＋` in the sidebar shelf — name it *Audit auth flow*.
3. Reload the page — the entry survives (localStorage `t3code:prompt-library:v1`).
4. Click a saved prompt in the shelf — text is appended to the existing composer text.
5. Open the command palette (`Ctrl/⌘+K`), filter by name, press Enter — text is appended again, and the entry is still in the library.

The composer deliberately keeps its contents at every step: insertion is copy-on-use, never cut.

This is an **interaction prototype** of the plugin's UI and behavior, not a screen recording of a running T3 Code build. It is served locally so the persistence step is real.

## Run it yourself

```bash
cd demo
python3 -m http.server 8899
# open http://127.0.0.1:8899/demo.html
```
