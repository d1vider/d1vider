(function () {
  "use strict";
  const B = window.BUSINESS;
  const $ = (s) => document.querySelector(s);
  const money = (n) => B.currency + (Number.isInteger(n) ? n : n.toFixed(2));
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtTime = (min) => {
    const h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "pm" : "am";
    return `${((h + 11) % 12) + 1}:${pad(m)}${ap}`;
  };
  const fmtDur = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ") || "0 min";
  };
  const fmtDate = (d) => d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- state ----------
  const state = {
    tab: B.categories[0].id,
    cart: [],            // { key, serviceId, optIdx, qty }
    addOns: new Set(),
    date: null,          // Date
    time: null,          // minutes from midnight
    month: (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(),
  };

  const services = {};
  B.categories.forEach((c) => c.services.forEach((s) => (services[s.id] = s)));

  // ---------- static text ----------
  document.querySelectorAll("[data-bind]").forEach((el) => (el.textContent = B[el.dataset.bind]));
  document.title = `${B.name} — Prices & Booking`;
  const workNames = B.workingDays.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]);
  $("#hero-facts").innerHTML = [
    `🗓️ ${workNames.length === 7 ? "Every day" : workNames.join(", ")}`,
    `⏰ ${fmtTime(toMin(B.dayStart))} – ${fmtTime(toMin(B.dayEnd))}`,
    `📍 I come to you`,
  ].map((t) => `<li>${t}</li>`).join("");
  $("#notes").innerHTML = B.notes.map((n) => `<li>${esc(n)}</li>`).join("");
  const fp = $("#foot-phone"); fp.textContent = B.phoneDisplay; fp.href = `tel:${B.phoneDisplay.replace(/[^\d+]/g, "")}`;
  const fe = $("#foot-email"); fe.textContent = B.email; fe.href = `mailto:${B.email}`;

  // ---------- prices / services ----------
  function renderTabs() {
    $("#tabs").innerHTML = B.categories.map((c) =>
      `<button role="tab" aria-selected="${c.id === state.tab}" data-tab="${c.id}">${c.icon} ${esc(c.title)}</button>`
    ).join("");
  }
  function renderServices() {
    const cat = B.categories.find((c) => c.id === state.tab);
    $("#service-list").innerHTML = cat.services.map((s) => `
      <article class="card service">
        <div class="service-head">
          <h3>${esc(s.name)}</h3>
          ${s.popular ? '<span class="badge">Most popular</span>' : ""}
        </div>
        <p class="muted">${esc(s.desc)}</p>
        <ul class="opts">
          ${s.options.map((o, i) => {
            const inCart = state.cart.find((c) => c.serviceId === s.id && c.optIdx === i);
            return `<li>
              <span class="opt-label">${esc(o.label)}<small>${fmtDur(o.minutes)}</small></span>
              <span class="opt-price">${money(o.price)}${s.perItem ? "<small>each</small>" : ""}</span>
              <button class="add ${inCart ? "added" : ""}" data-add="${s.id}" data-opt="${i}">
                ${inCart ? (s.perItem ? `✓ ${inCart.qty}` : "✓ Added") : "Add"}
              </button>
            </li>`;
          }).join("")}
        </ul>
      </article>`).join("");
  }
  function renderAddOns() {
    $("#addon-list").innerHTML = B.addOns.map((a) => `
      <label class="addon ${state.addOns.has(a.id) ? "on" : ""}">
        <input type="checkbox" data-addon="${a.id}" ${state.addOns.has(a.id) ? "checked" : ""}>
        <span>${esc(a.name)}</span><strong>+${money(a.price)}</strong>
      </label>`).join("");
  }

  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    state.tab = b.dataset.tab; renderTabs(); renderServices();
  });
  $("#service-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    const s = services[b.dataset.add], optIdx = Number(b.dataset.opt);
    const existing = state.cart.find((c) => c.serviceId === s.id && c.optIdx === optIdx);
    if (existing && s.perItem) existing.qty++;
    else if (existing) { state.cart = state.cart.filter((c) => c !== existing); toast("Removed"); update(); return; }
    else state.cart.push({ key: `${s.id}:${optIdx}`, serviceId: s.id, optIdx, qty: 1 });
    toast(`Added: ${s.name} — ${s.options[optIdx].label}`);
    update();
  });
  $("#addon-list").addEventListener("change", (e) => {
    const id = e.target.dataset.addon; if (!id) return;
    e.target.checked ? state.addOns.add(id) : state.addOns.delete(id);
    update();
  });

  // ---------- totals ----------
  function totals() {
    let price = 0, minutes = 0;
    state.cart.forEach((c) => { const o = services[c.serviceId].options[c.optIdx]; price += o.price * c.qty; minutes += o.minutes * c.qty; });
    if (state.cart.length) B.addOns.forEach((a) => { if (state.addOns.has(a.id)) { price += a.price; minutes += a.minutes; } });
    return { price, minutes };
  }

  function renderCart() {
    $("#cart-empty").hidden = state.cart.length > 0;
    $("#cart").innerHTML = state.cart.map((c) => {
      const s = services[c.serviceId], o = s.options[c.optIdx];
      return `<li>
        <div><strong>${esc(s.name)}</strong><small>${esc(o.label)}</small></div>
        ${s.perItem ? `<span class="qty">
          <button data-q="-1" data-key="${c.key}" aria-label="Fewer">−</button>${c.qty}<button data-q="1" data-key="${c.key}" aria-label="More">+</button>
        </span>` : ""}
        <span class="line-price">${money(o.price * c.qty)}</span>
        <button class="remove" data-remove="${c.key}" aria-label="Remove">×</button>
      </li>`;
    }).join("") + (state.cart.length ? B.addOns.filter((a) => state.addOns.has(a.id)).map((a) =>
      `<li class="addon-line"><div>+ ${esc(a.name)}</div><span class="line-price">${money(a.price)}</span></li>`).join("") : "");
    const t = totals();
    $("#sum-time").textContent = state.cart.length ? `about ${fmtDur(t.minutes)}` : "—";
    $("#sum-total").textContent = state.cart.length ? money(t.price) : "—";
    $("#sum-when").textContent = state.date && state.time != null
      ? `${fmtDate(state.date)}, ${fmtTime(state.time)}` : state.date ? fmtDate(state.date) : "—";
    const bar = $("#sticky-bar");
    bar.classList.toggle("show", state.cart.length > 0);
    $("#sticky-text").textContent = state.cart.length
      ? `${state.cart.reduce((n, c) => n + c.qty, 0)} item(s) · ${money(t.price)}` : "";
  }
  $("#cart").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"), r = e.target.closest("[data-remove]");
    if (q) { const c = state.cart.find((x) => x.key === q.dataset.key); c.qty += Number(q.dataset.q); if (c.qty < 1) state.cart = state.cart.filter((x) => x !== c); }
    if (r) state.cart = state.cart.filter((x) => x.key !== r.dataset.remove);
    update();
  });

  // ---------- availability ----------
  const dayLen = toMin(B.dayEnd) - toMin(B.dayStart);
  const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

  function dayOpen(d) {
    const diff = Math.round((d - today0()) / 86400000);
    return diff >= 0 && diff <= B.bookAheadDays && B.workingDays.includes(d.getDay()) && !B.daysOff.includes(ymd(d));
  }
  function slotsFor(d) {
    if (!dayOpen(d)) return [];
    const need = Math.min(totals().minutes || 60, dayLen); // long jobs: offer a morning start, I confirm
    const blocks = B.booked.filter((b) => b.date === ymd(d)).map((b) => [toMin(b.from), toMin(b.to)]);
    const earliest = Date.now() + B.minNoticeHours * 3600000;
    const out = [];
    for (let t = toMin(B.dayStart); t + need <= toMin(B.dayEnd); t += B.slotStepMinutes) {
      const start = new Date(d); start.setHours(0, t, 0, 0);
      if (start.getTime() < earliest) continue;
      const clash = blocks.some(([f, to]) => t < to + B.bufferMinutes && t + need + B.bufferMinutes > f);
      if (!clash) out.push(t);
    }
    return out;
  }

  function renderCalendar() {
    const m = state.month;
    $("#cal-label").textContent = m.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const first = m.getDay(), days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    let html = "";
    for (let i = 0; i < first; i++) html += "<span></span>";
    for (let day = 1; day <= days; day++) {
      const d = new Date(m.getFullYear(), m.getMonth(), day);
      const open = slotsFor(d).length > 0;
      const sel = state.date && ymd(d) === ymd(state.date);
      const past = d < today0();
      html += `<button class="day ${open ? "open" : "closed"} ${sel ? "sel" : ""} ${past ? "past" : ""}"
        ${open ? "" : "disabled"} data-date="${ymd(d)}" aria-label="${fmtDate(d)}${open ? "" : " (unavailable)"}">${day}</button>`;
    }
    $("#cal-days").innerHTML = html;
    const now = new Date(), thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(today0().getTime() + B.bookAheadDays * 86400000);
    $("#cal-prev").disabled = m <= thisMonth;
    $("#cal-next").disabled = new Date(m.getFullYear(), m.getMonth() + 1, 1) > lastDay;
  }
  $("#cal-prev").onclick = () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCalendar(); };
  $("#cal-next").onclick = () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCalendar(); };
  $("#cal-days").addEventListener("click", (e) => {
    const b = e.target.closest("[data-date]"); if (!b || b.disabled) return;
    const [y, mo, da] = b.dataset.date.split("-").map(Number);
    state.date = new Date(y, mo - 1, da); state.time = null; update();
  });

  function renderSlots() {
    const hint = $("#slot-hint"), box = $("#slots");
    if (!state.date) { hint.textContent = "Pick a day first."; box.innerHTML = ""; return; }
    const slots = slotsFor(state.date);
    if (state.time != null && !slots.includes(state.time)) state.time = null;
    const t = totals().minutes;
    hint.textContent = !state.cart.length
      ? `Times for ${fmtDate(state.date)}. Add your services so I can show times that fit the full job.`
      : t > dayLen
        ? `This job is about ${fmtDur(t)}, more than one working day. Pick a start and I'll confirm a plan with you.`
        : `Start times on ${fmtDate(state.date)} with room for your ${fmtDur(t)} job:`;
    box.innerHTML = slots.length
      ? slots.map((s) => `<button class="slot ${s === state.time ? "sel" : ""}" data-time="${s}">${fmtTime(s)}</button>`).join("")
      : `<p class="muted">No free times left that day for a job this size. Try another day.</p>`;
  }
  $("#slots").addEventListener("click", (e) => {
    const b = e.target.closest("[data-time]"); if (!b) return;
    state.time = Number(b.dataset.time); update();
  });

  // ---------- send ----------
  function buildMessage() {
    const f = new FormData($("#details")), t = totals();
    const lines = [
      `Hi! I'd like to book with ${B.name}.`,
      ``,
      `📅 ${fmtDate(state.date)} at ${fmtTime(state.time)}`,
      ``,
      `Services:`,
      ...state.cart.map((c) => { const s = services[c.serviceId], o = s.options[c.optIdx];
        return `• ${s.name} — ${o.label}${c.qty > 1 ? ` × ${c.qty}` : ""} (${money(o.price * c.qty)})`; }),
      ...B.addOns.filter((a) => state.addOns.has(a.id)).map((a) => `• Add-on: ${a.name} (${money(a.price)})`),
      ``,
      `Estimated total: ${money(t.price)} (about ${fmtDur(t.minutes)})`,
      ``,
      `Name: ${f.get("name").trim()}`,
      `Phone: ${f.get("phone").trim()}`,
      `Address: ${f.get("address").trim()}`,
    ];
    const notes = f.get("notes").trim();
    if (notes) lines.push(`Notes: ${notes}`);
    return lines.join("\n");
  }
  function validate() {
    const err = $("#form-error");
    const f = $("#details");
    let msg = "";
    if (!state.cart.length) msg = "Add at least one service.";
    else if (!state.date) msg = "Pick a day.";
    else if (state.time == null) msg = "Pick a start time.";
    else {
      const bad = [...f.querySelectorAll("[required]")].find((i) => !i.value.trim());
      if (bad) { msg = "Please fill in your name, phone and address."; bad.focus(); }
    }
    err.textContent = msg;
    return !msg;
  }
  $("#send-wa").onclick = () => {
    if (!validate()) return;
    window.open(`https://wa.me/${B.whatsapp}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener");
  };
  $("#send-email").onclick = () => {
    if (!validate()) return;
    const subject = `Booking request — ${fmtDate(state.date)} ${fmtTime(state.time)}`;
    location.href = `mailto:${B.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`;
  };

  // ---------- misc ----------
  let toastTimer;
  function toast(text) {
    const t = $("#toast"); t.textContent = text; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function update() {
    renderServices(); renderAddOns(); renderCart(); renderCalendar(); renderSlots();
    if (state.cart.length || state.date) $("#form-error").textContent = "";
  }
  renderTabs(); update();
})();
