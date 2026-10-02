async () => {
  // Settings. Edit these for the page you are measuring.
  const WAIT_MS = 6000; // time for data fetched after hydration to render
  const isLine = el => {
    // A "line" is a wrapping flex row. The default is tuned to one layout, so adjust it per page.
    const s = getComputedStyle(el);
    return s.display === 'flex' && s.flexWrap === 'wrap' && s.columnGap === '6px' && s.alignItems === 'center' && el.children.length > 2;
  };

  await new Promise(r => setTimeout(r, WAIT_MS));
  document.getElementById('gap-ov')?.remove();
  const ov = document.createElement('div');
  ov.id = 'gap-ov';
  ov.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:99999;pointer-events:none';
  document.body.appendChild(ov);
  const sx = scrollX, sy = scrollY;
  const draw = (x, y, w, h, fill, solid, label) => {
    const b = document.createElement('div');
    b.style.cssText = `position:absolute;left:${x + sx}px;top:${y + sy}px;width:${w}px;height:${Math.max(h, 2)}px;background:${h >= 1 ? fill : solid};`;
    ov.appendChild(b);
    const t = document.createElement('span');
    t.textContent = label;
    t.style.cssText = `position:absolute;left:${x + w + 3 + sx}px;top:${y + h / 2 + sy}px;transform:translateY(-50%);background:${solid};color:#fff;font:700 10px/12px monospace;padding:1px 3px;border-radius:3px;white-space:nowrap;`;
    ov.appendChild(t);
  };
  const PINK = ['rgba(236,0,120,0.35)', '#d6006c'], BLUE = ['rgba(0,110,255,0.3)', '#0a64e6'];
  const lines = [...document.querySelectorAll('div,li')].filter(isLine);
  const report = {};
  const add = k => (report[k] = (report[k] || 0) + 1);
  lines.forEach(el => {
    const r = el.getBoundingClientRect();
    const kids = [...el.children].map(c => c.getBoundingClientRect()).filter(k => k.height > 0).sort((a, b) => a.top - b.top);
    // Children that overlap vertically belong to the same wrapped row.
    const rows = [];
    kids.forEach(k => {
      const last = rows[rows.length - 1];
      if (last && k.top < last.bottom - 1) { last.top = Math.min(last.top, k.top); last.bottom = Math.max(last.bottom, k.bottom); }
      else rows.push({ top: k.top, bottom: k.bottom });
    });
    for (let i = 0; i + 1 < rows.length; i++) {
      const gap = Math.round(rows[i + 1].top - rows[i].bottom);
      draw(r.left, rows[i].bottom, r.width, gap, PINK[0], PINK[1], `${gap}px`);
      add(`wrap ${gap}px`);
    }
    const next = el.nextElementSibling;
    if (next && lines.includes(next)) {
      const gap = Math.round(next.getBoundingClientRect().top - r.bottom);
      draw(r.left, r.bottom, r.width, gap, BLUE[0], BLUE[1], `${gap}px`);
      add(`next ${gap}px`);
    }
  });
  return { host: location.host, w: innerWidth, report };
}
