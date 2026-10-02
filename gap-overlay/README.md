# gap-overlay

Draws the vertical gaps of wrapping flex rows on a live page and labels each one with its measured pixel value. Useful for before and after screenshots of spacing changes.

- **Pink**: gap between wrapped rows inside one line (`wrap`)
- **Blue**: gap between one line and the next sibling line (`next`)

Values are measured from element positions, not read from CSS, so they show what is actually rendered.

## Usage

### As a Claude Code skill

This directory is a complete skill (`SKILL.md` plus `overlay.js`). Copy it into a skills directory to use the full before and after screenshot workflow:

```sh
cp -R gap-overlay ~/.claude/skills/          # all projects
cp -R gap-overlay <project>/.claude/skills/  # one project
```

### Chrome DevTools MCP (Claude Code)

1. Set the viewport with `emulate` (for example `375x812x2,mobile,touch`) and load the page.
2. Pass the whole contents of `overlay.js` as the `function` argument of `evaluate_script` with `waitForStableDom: false`.
3. Scroll to the area you want with another `evaluate_script` call, then `take_screenshot`.

The overlay is drawn in document coordinates, so it stays in place while scrolling. Running the script again replaces the previous overlay.

### Browser console

Paste the file contents wrapped in parentheses and call it:

```js
(/* contents of overlay.js */)().then(console.log)
```

## Return value

A summary of every measured gap, handy for quoting numbers in a PR:

```json
{ "host": "example.com", "w": 375, "report": { "wrap 0px": 33, "next 6px": 15 } }
```

## Adapting to another page

Edit the settings at the top of `overlay.js`.

- `WAIT_MS`: delay before measuring. Raise it if data loads late.
- `isLine`: decides which elements count as a line. The default is tuned to one layout (`display: flex`, `flex-wrap: wrap`, `column-gap: 6px`, `align-items: center`, more than two children). Change the conditions to match the target layout.

## Limits

- Rows are found by vertical overlap of children, so a child taller than its row can merge two rows.
- Labels sit just right of each line. Content that overflows the line can be partly covered.
- Viewport changes after drawing do not update the overlay. Reload and run it again.
