/*
 * Redline tachometer face, drawn inside the logo ring.
 * Coordinates match assets/img/ring.webp (1266 × 1107, centre 552,554).
 * 0–8 ×1000 r/min over 270°, redline from 6.5.
 *
 *   redlineGauge(svgElement, { value: 7.4, animate: true })
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const CX = 552, CY = 554, R = 425, A0 = 135, PER = 33.75, RED = 6.5, MAX = 8;
  const el = (n, a, parent) => {
    const e = document.createElementNS(NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const pt = (deg, r) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)];
  const angle = (v) => A0 + v * PER;

  const STYLE = `
    .g-tick { stroke: #8a9198; stroke-width: 5; stroke-linecap: round; }
    .g-tick.major { stroke: #e3e7eb; stroke-width: 9; }
    .g-tick.hot { stroke: #ff3c42; }
    .g-num { fill: #e3e7eb; font: 600 56px "JetBrains Mono", ui-monospace, Menlo, monospace; text-anchor: middle; dominant-baseline: central; paint-order: stroke; stroke: rgba(0,0,0,.85); stroke-width: 10px; }
    .g-num.hot { fill: #ff4a50; }
    .g-zone { fill: none; stroke: #e3161d; stroke-width: 14; stroke-linecap: round; }
    .g-unit { fill: #8a9198; font: 600 28px "JetBrains Mono", ui-monospace, Menlo, monospace; letter-spacing: 4px; text-anchor: middle; }
    .g-read { fill: #f2f4f6; font: 700 74px "Chakra Petch", "JetBrains Mono", ui-monospace, monospace; font-style: italic; text-anchor: middle; font-variant-numeric: tabular-nums; }
    .g-rpm { fill: #ff3c42; font: 700 26px "JetBrains Mono", ui-monospace, monospace; letter-spacing: 4px; text-anchor: middle; }
    .g-needle { fill: #ff3c42; }
    .g-cap { fill: #15181c; stroke: #d5dade; stroke-width: 7; }
    .g-cap-in { fill: #e3161d; }
  `;

  window.redlineGauge = function (svg, opts) {
    const o = Object.assign({ value: 7.4, animate: false }, opts || {});
    svg.setAttribute("viewBox", "0 0 1266 1107");
    svg.innerHTML = "";
    el("style", {}, svg).textContent = STYLE;
    const defs = el("defs", {}, svg);
    const glow = el("filter", { id: "g-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: "9", result: "b" }, glow);
    const merge = el("feMerge", {}, glow);
    el("feMergeNode", { in: "b" }, merge); el("feMergeNode", { in: "SourceGraphic" }, merge);

    // red zone
    const [zx0, zy0] = pt(angle(RED), R + 18), [zx1, zy1] = pt(angle(MAX), R + 18);
    el("path", { class: "g-zone", filter: "url(#g-glow)", d: `M${zx0} ${zy0} A${R + 18} ${R + 18} 0 0 1 ${zx1} ${zy1}` }, svg);
    // ticks + numbers
    for (let v = 0; v <= MAX + 1e-9; v += 0.5) {
      const a = angle(v), major = Math.abs(v % 1) < 1e-9, hot = v >= RED;
      const [x1, y1] = pt(a, R), [x2, y2] = pt(a, R - (major ? 50 : 28));
      el("line", { class: `g-tick${major ? " major" : ""}${hot ? " hot" : ""}`, x1, y1, x2, y2 }, svg);
      if (major) {
        const [tx, ty] = pt(a, R - 98);
        el("text", { class: `g-num${hot ? " hot" : ""}`, x: tx, y: ty }, svg).textContent = v;
      }
    }
    // labels in the open bottom of the dial
    el("text", { class: "g-unit", x: CX, y: CY + 140 }, svg).textContent = "×1000 r/min";
    const read = el("text", { class: "g-read", x: CX - 22, y: CY + 248 }, svg);
    el("text", { class: "g-rpm", x: CX + 128, y: CY + 246 }, svg).textContent = "RPM";
    // needle (drawn pointing right, rotated into place)
    const needle = el("g", {}, svg);
    el("path", { class: "g-needle", filter: "url(#g-glow)", d: `M${CX - 70} ${CY - 13} L${CX + 372} ${CY - 4} Q${CX + 388} ${CY} ${CX + 372} ${CY + 4} L${CX - 70} ${CY + 13} Z` }, needle);
    el("circle", { class: "g-cap", cx: CX, cy: CY, r: 44 }, svg);
    el("circle", { class: "g-cap-in", cx: CX, cy: CY, r: 15 }, svg);

    const set = (v) => {
      needle.setAttribute("transform", `rotate(${angle(v)} ${CX} ${CY})`);
      read.textContent = String(Math.round((v * 1000) / 50) * 50).padStart(4, "0");
    };
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!o.animate || reduce) { set(o.value); return; }

    // rev: 0 → 8 (just past redline) → settle on the target with a little bounce
    const keys = [[0, 0], [0.5, 7.92], [0.68, 6.7], [0.82, 7.3], [1, o.value]];
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const DUR = 2400, start = performance.now() + 250;
    set(0);
    const tick = (now) => {
      const t = Math.min(Math.max((now - start) / DUR, 0), 1);
      let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
      set(v0 + (v1 - v0) * ease((t - t0) / (t1 - t0)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
})();
