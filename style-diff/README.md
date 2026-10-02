# style-diff

Compares the rendered layout of two versions of a page (for example a base preview and a PR preview) node by node: position, size and computed CSS.

## Usage

1. In Chrome DevTools MCP, set the same viewport for both pages with `emulate` (for example `390x844x1,mobile,touch`).
2. Load the base page and run `capture.js` as the `function` of `evaluate_script` with `waitForStableDom: false` and `filePath: <dir>/before.json`. The file must be inside a workspace root.
3. Load the changed page and capture `after.json` the same way.
4. Compare:

```sh
node diff.js before.json after.json                # every node, geometry included
node diff.js before.json after.json --skip-lists   # ignore children of lists (live table rows)
node diff.js before.json after.json --no-geo       # styles only, ignore x/y/w/h
node diff.js before.json after.json --limit 200    # print more lines (default 60)
```

`compared 449 vs 449 nodes, 0 diffs` means the two renders match. Exit code is 1 when anything differs.

Edit `ROOT`, `WAIT_MS` and `PROPS` at the top of `capture.js` to change what is measured.

## Notes

* Use a separate tab, or `emulate` on each tab, per viewport. Resizing the window does not reflow background tabs.
* Live data (relative times, new rows) shows up as diffs. Check the deepest differing path before treating it as a layout change.
* Text is not compared, so a changed character that alters wrapping (for example U+202F turned into a normal space) only appears as a height diff.
