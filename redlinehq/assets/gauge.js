/*
 * Redline tachometer face, drawn inside the logo ring.
 * Coordinates match assets/img/ring.webp (1120 × 1120, centre 560,560).
 * 0–8 ×1000 r/min over 270°, redline from 6.5.
 *
 *   redlineGauge(svgElement, { value: 0.7, animate: true })
 *   animate: blips to ~4k, drops to ~2k, pulls into the redline, settles at idle;
 *   the meter (svg.parentElement, or opts.shake) rumbles while revving.
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const CX = 560, CY = 560, R = 425, A0 = 135, PER = 33.75, RED = 6.5, MAX = 8;
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
    const o = Object.assign({ value: 0.7, animate: false }, opts || {});
    svg.setAttribute("viewBox", "0 0 1120 1120");
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
      read.textContent = String(Math.round((v * 1000) / 50) * 50);
    };
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!o.animate || reduce) { set(o.value); return; }

    // Two revs: a blip to ~4k, falls to ~2k, then a pull into the redline
    // (a quick bounce off the limiter), then back down to idle.
    // [time ms, rpm ×1000, easing into this point]
    const up = (t) => 1 - Math.pow(1 - t, 2.2);          // throttle: fast, then slowing
    const down = (t) => t * t * (3 - 2 * t);              // revs falling off
    const keys = [
      [0, o.value], [350, o.value, down],
      [700, 4.1, up], [1200, 2.0, down],
      [1800, 7.85, up], [1880, 7.55, down], [1960, 7.9, up], [2060, 7.6, down],
      [3100, o.value - 0.2, down], [3450, o.value, down],
    ];
    const END = keys[keys.length - 1][0];
    const valueAt = (ms) => {
      let i = 0; while (i < keys.length - 2 && ms > keys[i + 1][0]) i++;
      const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1];
      const p = Math.min(Math.max((ms - t0) / (t1 - t0), 0), 1);
      return v0 + (v1 - v0) * (e || down)(p);
    };

    // Rumble: the meter shakes a little while the revs climb, more near the redline.
    // Uses the `translate`/`rotate` properties so it never fights other transforms.
    const shaker = o.shake === false ? null : o.shake || svg.parentElement;
    let last = o.value;
    const rumble = (v, ms) => {
      if (!shaker) return;
      const rising = Math.max(v - last, 0) * 60;                 // how hard the throttle is pushing
      const amp = Math.min(0.15 + (v / MAX) * 1.1 + rising * 0.5, 2.2);
      const s = Math.sin(ms * 0.11), c = Math.cos(ms * 0.173);   // engine-ish wobble
      shaker.style.translate = `${(s * 0.6 + (Math.random() - 0.5)) * amp}px ${(c * 0.6 + (Math.random() - 0.5)) * amp}px`;
      shaker.style.rotate = `${(Math.random() - 0.5) * amp * 0.25}deg`;
    };
    const still = () => { if (shaker) { shaker.style.translate = ""; shaker.style.rotate = ""; } };

    const start = performance.now() + 300;
    set(o.value);
    const tick = (now) => {
      const ms = now - start;
      if (ms < 0) { requestAnimationFrame(tick); return; }
      const v = valueAt(Math.min(ms, END));
      set(v);
      if (ms < END) { rumble(v, ms); last = v; requestAnimationFrame(tick); }
      else still();
    };
    requestAnimationFrame(tick);
  };
})();
