#!/usr/bin/env node
// Compare two capture.js outputs node by node.
// usage: node diff.js <before.json> <after.json> [--skip-lists] [--no-geo] [--limit N]
const fs = require("fs");

const args = process.argv.slice(2);
const files = args.filter(a => !a.startsWith("--") && !/^\d+$/.test(a));
const skipLists = args.includes("--skip-lists");
const noGeo = args.includes("--no-geo");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? +args[limitIdx + 1] : 60;

if (files.length !== 2) {
  console.error("usage: node diff.js <before.json> <after.json> [--skip-lists] [--no-geo] [--limit N]");
  process.exit(1);
}

// Accepts raw JSON or the evaluate_script output file, which wraps the JSON in text.
const load = f => {
  const t = fs.readFileSync(f, "utf8");
  const j = JSON.parse(t.slice(t.search(/[[{]/), Math.max(t.lastIndexOf("]"), t.lastIndexOf("}")) + 1));
  if (j.out) console.log(`${f}: ${j.href} (${j.iw}px)`);
  return j.out || j;
};

// --skip-lists drops everything inside a parent with more than 6 children (table rows, feeds),
// so live data that changes between captures does not drown the layout diff.
const index = nodes => {
  let keep = nodes;
  if (skipLists) {
    const kids = {};
    for (const n of nodes) {
      const parent = n.p.slice(0, n.p.lastIndexOf(">"));
      kids[parent] = (kids[parent] || 0) + 1;
    }
    const lists = Object.keys(kids).filter(k => kids[k] > 6);
    keep = nodes.filter(n => !lists.some(l => n.p.startsWith(l + ">")));
  }
  return new Map(keep.map(n => [n.p, n]));
};

const GEO = ["x", "y", "w", "h"];
const a = index(load(files[0]));
const b = index(load(files[1]));
const lines = [];

for (const [p, n] of a) {
  const m = b.get(p);
  if (!m) {
    lines.push(`ONLY_BEFORE ${p}`);
    continue;
  }
  for (const k of Object.keys(n)) {
    if (k === "p" || (noGeo && GEO.includes(k))) continue;
    if (n[k] !== m[k]) lines.push(`${p} ${k}: ${n[k]} -> ${m[k]}`);
  }
}
for (const p of b.keys()) if (!a.has(p)) lines.push(`ONLY_AFTER ${p}`);

console.log(`compared ${a.size} vs ${b.size} nodes, ${lines.length} diffs`);
if (lines.length) console.log(lines.slice(0, limit).join("\n"));
process.exitCode = lines.length ? 1 : 0;
