async () => {
  const ROOT = "main";
  const WAIT_MS = 7000;
  const MAX_DEPTH = 18;
  const PROPS = [
    "display", "gridTemplateColumns", "rowGap", "columnGap",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "marginTop", "marginBottom", "marginLeft",
    "fontSize", "fontWeight", "lineHeight", "color", "backgroundColor",
    "borderRadius", "boxShadow", "position", "width", "height", "stroke", "fill",
  ];

  await new Promise(r => setTimeout(r, WAIT_MS));
  await document.fonts.ready;

  const out = [];
  const walk = (el, path, depth) => {
    if (depth > MAX_DEPTH) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    const node = { p: path, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    PROPS.forEach(k => (node[k] = cs[k]));
    out.push(node);
    if (tag === "svg" || tag === "canvas") return;
    [...el.children].forEach((c, i) => walk(c, `${path}>${c.tagName.toLowerCase()}${i}`, depth + 1));
  };
  walk(document.querySelector(ROOT), ROOT, 0);
  return { href: location.href, iw: innerWidth, out };
}
