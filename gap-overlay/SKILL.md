---
name: gap-overlay
description: Overlay measured vertical gaps (with pixel labels) on a live page in Chrome through the chrome-devtools MCP tools, then take before and after screenshots of a spacing change and put them in a PR table. Use when asked to show, measure, annotate, or screenshot spacing, gaps, row-gap, or line spacing, or to make PR screenshots that show pixel values.
---

# Gap overlay screenshots

The script is `overlay.js` in this skill's directory (usage notes in `README.md` next to it).
Read it and pass its contents directly. Do not copy it into the project.

It colors every vertical gap of wrapping flex rows and labels the measured value:
- **Pink** (`wrap`): between wrapped rows inside one line
- **Blue** (`next`): between a line and its next sibling line

It returns a count per gap value, for example `{"wrap 0px": 33, "next 6px": 15}`. Quote those numbers in the report or PR.

## 1. Fit the script to the page

The `isLine` predicate at the top of `overlay.js` decides which elements count as a line. Its default is tuned to one layout (`flex`, `wrap`, `column-gap: 6px`, `align-items: center`, more than two children), so always check it.
Inspect the target with `evaluate_script` first (computed `display`, `flex-wrap`, `gap`, child count) and pass an edited copy of the function when the default does not match. Do not change the saved file unless the user asks.
Raise `WAIT_MS` if the page renders data late.

## 2. Capture each state

Load tool schemas with `ToolSearch`: `select:mcp__chrome-devtools__new_page,mcp__chrome-devtools__navigate_page,mcp__chrome-devtools__evaluate_script,mcp__chrome-devtools__take_screenshot,mcp__chrome-devtools__emulate`.

Decide the two URLs first: "before" is a deployment or local run of the base branch, "after" is the branch with the change. Confirm both exist and serve the same data before comparing.

For every width and every state (before, after):
1. `emulate` the viewport, for example `375x812x2,mobile,touch`, `1024x900x1`, `1440x900x1`. Match the project's breakpoints.
2. `navigate_page` (or `reload` after changing the viewport, so layout and data are fresh).
3. `evaluate_script` with the script contents and `waitForStableDom: false`. Record the returned report.
4. Scroll to the area in a separate `evaluate_script` call (`el.scrollIntoView({block: 'start'}); scrollBy(0, -60)`). The overlay stays aligned because it uses document coordinates.
5. `take_screenshot` with `filePath` inside the current project directory (for example `<project>/pr-<n>-screenshots/before-375-<area>.png`), not `/tmp`, unless the user says otherwise.
6. Read the screenshot back and check labels do not hide the content. If they do, adjust label placement in the passed copy and retake.

Keep the git status clean: add the screenshot folder to `.git/info/exclude`, and tell the user, since editors may then hide or dim the folder.

## 3. Put screenshots in the PR

`gh pr edit --attach` uploads local files and rewrites `![alt](./file.png)` references in the body to the uploaded URLs. Check support with `gh pr edit --help` first. Without it, write the table with file name placeholders and ask the user to drag the images in.

1. Write the body with one table per area: `| Width | Before | After |`, each row on a single line (line breaks inside a cell break the table), cells as `![name](./name.png)`.
2. From the screenshot folder run `gh pr edit <n> --body-file body.md --attach ./a.png --attach ./b.png ...`.
3. Fetch the body again and replace each `![alt](https://github.com/user-attachments/...)` with `<img width="W" alt="alt" src="..." />` so the table stays short. For example width 240 for mobile shots and 400 for tablet and desktop. Omit `height` to keep the aspect ratio.
4. Add a one line legend above the tables explaining pink and blue.
5. Confirm with the user before publishing, and follow the project's PR wording conventions.
