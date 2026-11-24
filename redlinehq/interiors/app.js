(function () {
  "use strict";
  // Closed ("open: false" in config.js): the page shows "coming soon" instead, so skip the booking app.
  // At /interiors/?preview it runs as normal so you can test changes.
  if (document.documentElement.classList.contains("rl-closed")) return;
  const B = window.BUSINESS;
  const $ = (s) => document.querySelector(s);

  // ---------- language ----------
  const STR = {
    es: {
      bookNow: "Reservar", lead: "Mira cuánto cuesta cada servicio, escoge un día y hora libre, y separa tu cita en menos de un minuto.",
      seePrices: "Ver precios", pickTime: "Escoger hora", factDays: "Lun – Sáb", factHome: "Voy a donde estés",
      kPrices: "Servicios", pricesTitle: "Servicios y precios", pricesSub: "Toca Añadir en lo que necesites. Puedes combinar auto y hogar en la misma visita.",
      addOns: "Extras", add: "Añadir", added: "✓ Añadido", each: "c/u", popular: "Más pedido", removed: "Quitado",
      kAbout: "Sobre mí", aboutTitle: "Detallado hecho con pasión por los carros", galleryTitle: "Trabajos recientes",
      kBook: "Citas", bookTitle: "Separa tu cita", bookSub: "Escoge un día y hora, llena tus datos y envía la solicitud. La cita queda confirmada al recibir el depósito.",
      step1: "Escoge un día", step2: "Escoge la hora de llegada", step3: "Tus datos",
      legendOpen: "Disponible", legendFull: "Ocupado / día libre", calLoading: "Buscando horarios…", calLive: "Horarios en vivo", calErr: "No se pudieron cargar horarios en vivo",
      slotPickDay: "Escoge un día primero.",
      slotNoCart: (d) => `Horas para el ${d}. Añade tus servicios para ver horas donde quepa el trabajo completo.`,
      slotLong: (dur) => `Este trabajo toma ${dur}, más de un día de trabajo. Escoge la hora de inicio y coordinamos.`,
      slotFit: (d, dur) => `Horas el ${d} con espacio para tu trabajo de ${dur}:`,
      slotNone: "No quedan horas ese día para un trabajo de este tamaño. Prueba otro día.",
      fName: "Nombre completo", fPhone: "Teléfono", fAddress: "Dirección (donde voy a trabajar)", fTown: "Pueblo",
      fTownPick: "Escoge…", fTownOther: "Otro (pregúntame)",
      fNotes: "Marca y modelo del auto, tipo de tela, manchas, mascotas… (opcional)",
      yourBooking: "Tu cita", cartEmpty: "No has añadido nada.", browse: "Ver servicios",
      estTime: "Tiempo estimado", when: "Cuándo", estTotal: "Total estimado", depositNow: "Depósito para separar", balance: "Balance el día del servicio",
      send: "Solicitar cita", sending: "Enviando…", sendEmail: "Enviar por email",
      fineAll: (dep) => `Depósito de ${dep} por ATH Móvil o PayPal. Se descuenta del total.`,
      fine: (dep, from) => `Trabajos de ${from} o más: depósito de ${dep} por ATH Móvil o PayPal, que se descuenta del total. Trabajos más pequeños: sin depósito.`,
      noDeposit: "No requiere", depositHero: (from) => `Depósito (${from}+)`,
      doneBodyFree: (when) => `Tu hora del <strong>${when}</strong> está separada. Este trabajo <strong>no requiere depósito</strong>: te confirmo por WhatsApp.`,
      payOnDay: (tot) => `Pagas <strong>${tot}</strong> el día del servicio en efectivo, ATH Móvil o PayPal.`,
      doneWaFree: "Escribirme por WhatsApp", msgNoDeposit: "Sin depósito (trabajo menor)",
      payWith: "Pagos", payCash: "Efectivo", payPaypalAsk: "Te envío el enlace por WhatsApp", payBtn: (d) => `Pagar ${d} con PayPal`,
      payBalance: (bal) => `El balance de <strong>${bal}</strong> se paga el día del servicio en efectivo, ATH Móvil o PayPal.`,
      errCart: "Añade al menos un servicio.", errDay: "Escoge un día.", errTime: "Escoge una hora.",
      tooBig: (dur, max) => `Este trabajo toma ${dur}, más del máximo de ${max} por cita. Quita algunos servicios o escríbeme por WhatsApp y lo dividimos en dos visitas.`,
      errFields: "Llena tu nombre, teléfono, dirección y pueblo.", errTaken: "Alguien acaba de separar esa hora. Escoge otra, por favor.",
      privacy: "Solo uso tus datos para coordinar tu cita. No los comparto con nadie.",
      errHuman: "Confirma que no eres un robot (la casilla de arriba) y vuelve a intentar.",
      errNet: "No se pudo enviar la solicitud. Envíamela por WhatsApp:",
      doneTitleApi: "¡Solicitud recibida!", doneTitleWa: "¡Casi listo!",
      doneBody: (when, dep, hrs) => `Tu hora del <strong>${when}</strong> está separada. Envía el depósito de <strong>${dep}</strong> en las próximas ${hrs} horas para confirmarla:`,
      doneWaBtn: "Enviar comprobante por WhatsApp", doneWaAgain: "Abrir WhatsApp otra vez", doneAgain: "Hacer otra reserva",
      kInfo: "Info", goodToKnow: "Bueno saber", continue: "Continuar",
      nextTitle: "Próxima fecha libre", nextPick: "Escoger este día", fromLabel: "Desde", hoursLabel: "Horario",
      nextNone: "No quedan fechas libres en las próximas semanas. Escríbeme por WhatsApp y buscamos espacio.",
      items: (n) => `${n} ${n === 1 ? "servicio" : "servicios"}`, about: "aprox.",
      msgHi: (n) => `¡Hola! Quiero separar una cita con ${n}.`, msgServices: "Servicios:", msgAddon: "Extra",
      msgTotal: "Total estimado", msgDeposit: "Depósito", msgName: "Nombre", msgPhone: "Teléfono", msgAddr: "Dirección", msgNotes: "Notas",
      msgReceipt: "Te envío el comprobante del depósito.",
      emailSubject: "Solicitud de cita",
    },
    en: {
      bookNow: "Book now", lead: "See exactly what each service costs, pick a free day and time, and lock in your booking in under a minute.",
      seePrices: "See prices", pickTime: "Pick a time", factDays: "Mon – Sat", factHome: "I come to you",
      kPrices: "Services", pricesTitle: "Services & prices", pricesSub: "Tap Add on anything you need. You can mix car and home services in one visit.",
      addOns: "Add-ons", add: "Add", added: "✓ Added", each: "each", popular: "Most popular", removed: "Removed",
      kAbout: "About", aboutTitle: "Detailing driven by a love for cars", galleryTitle: "Recent work",
      kBook: "Booking", bookTitle: "Book your visit", bookSub: "Pick a day and time, fill in your details and send the request. Your booking is confirmed once the deposit is in.",
      step1: "Pick a day", step2: "Pick an arrival time", step3: "Your details",
      legendOpen: "Available", legendFull: "Booked / day off", calLoading: "Checking availability…", calLive: "Live availability", calErr: "Couldn't load live times",
      slotPickDay: "Pick a day first.",
      slotNoCart: (d) => `Times for ${d}. Add your services so I can show times that fit the full job.`,
      slotLong: (dur) => `This job takes about ${dur}, more than one working day. Pick a start time and we'll plan it together.`,
      slotFit: (d, dur) => `Start times on ${d} with room for your ${dur} job:`,
      slotNone: "No free times left that day for a job this size. Try another day.",
      fName: "Full name", fPhone: "Phone", fAddress: "Address (where I'll be working)", fTown: "Town",
      fTownPick: "Choose…", fTownOther: "Other (ask me)",
      fNotes: "Vehicle make/model, fabric type, stains, pets… (optional)",
      yourBooking: "Your booking", cartEmpty: "Nothing added yet.", browse: "Browse services",
      estTime: "Estimated time", when: "When", estTotal: "Estimated total", depositNow: "Deposit to book", balance: "Balance on service day",
      send: "Request booking", sending: "Sending…", sendEmail: "Send by email instead",
      fineAll: (dep) => `${dep} deposit by ATH Móvil or PayPal. It comes off your total.`,
      fine: (dep, from) => `Jobs of ${from} or more: ${dep} deposit by ATH Móvil or PayPal, which comes off your total. Smaller jobs: no deposit.`,
      noDeposit: "Not needed", depositHero: (from) => `Deposit (${from}+)`,
      doneBodyFree: (when) => `Your time on <strong>${when}</strong> is on hold. This job <strong>needs no deposit</strong>: I'll confirm on WhatsApp.`,
      payOnDay: (tot) => `You pay <strong>${tot}</strong> on the day of service by cash, ATH Móvil or PayPal.`,
      doneWaFree: "Message me on WhatsApp", msgNoDeposit: "No deposit (small job)",
      payWith: "Payment", payCash: "Cash", payPaypalAsk: "I'll send you the link on WhatsApp", payBtn: (d) => `Pay ${d} with PayPal`,
      payBalance: (bal) => `The <strong>${bal}</strong> balance is paid on the day of service by cash, ATH Móvil or PayPal.`,
      errCart: "Add at least one service.", errDay: "Pick a day.", errTime: "Pick a start time.",
      tooBig: (dur, max) => `This job takes ${dur}, over the ${max} limit per booking. Remove a few services, or send me a WhatsApp and we'll split it into two visits.`,
      errFields: "Please fill in your name, phone, address and town.", errTaken: "Someone just booked that time. Please pick another.",
      privacy: "I only use your details to schedule your visit. I never share them.",
      errHuman: "Please confirm you're not a robot (the box above) and try again.",
      errNet: "Couldn't send the request. Please send it on WhatsApp instead:",
      doneTitleApi: "Request received!", doneTitleWa: "Almost done!",
      doneBody: (when, dep, hrs) => `Your time on <strong>${when}</strong> is on hold. Send the <strong>${dep}</strong> deposit within ${hrs} hours to confirm it:`,
      doneWaBtn: "Send deposit receipt on WhatsApp", doneWaAgain: "Open WhatsApp again", doneAgain: "Make another booking",
      kInfo: "Info", goodToKnow: "Good to know", continue: "Continue",
      nextTitle: "Next open date", nextPick: "Pick this day", fromLabel: "From", hoursLabel: "Hours",
      nextNone: "No open dates in the next few weeks. Send me a WhatsApp and we'll find a slot.",
      items: (n) => `${n} item${n === 1 ? "" : "s"}`, about: "about",
      msgHi: (n) => `Hi! I'd like to book with ${n}.`, msgServices: "Services:", msgAddon: "Add-on",
      msgTotal: "Estimated total", msgDeposit: "Deposit", msgName: "Name", msgPhone: "Phone", msgAddr: "Address", msgNotes: "Notes",
      msgReceipt: "Sending you the deposit receipt.",
      emailSubject: "Booking request",
    },
  };
  let lang = B.defaultLang || "es";
  try { const saved = localStorage.getItem("lang"); if (saved && STR[saved]) lang = saved; } catch (e) {}
  const S = () => STR[lang];
  const L = (v) => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] ?? v.es ?? v.en) : v);
  const locale = () => (lang === "es" ? "es-PR" : "en-US");

  // ---------- helpers ----------
  const money = (n) => B.currency + (Number.isInteger(n) ? n : n.toFixed(2));
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtTime = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? "pm" : "am"}`;
  };
  const fmtDur = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ") || "0 min";
  };
  // Dates are "YYYY-MM-DD" strings in Puerto Rico time; UTC Date objects are only used for maths.
  const OFF = B.utcOffsetHours * 3600000;
  const utcDate = (ds) => { const [y, m, d] = ds.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const dsOf = (dt) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
  const todayPR = () => dsOf(new Date(Date.now() + OFF));
  const addDays = (ds, n) => dsOf(new Date(utcDate(ds).getTime() + n * 86400000));
  const daysBetween = (a, b) => Math.round((utcDate(b) - utcDate(a)) / 86400000);
  const fmtDate = (ds) => utcDate(ds).toLocaleDateString(locale(), { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------- state ----------
  const now0 = utcDate(todayPR());
  const state = {
    tab: B.categories[0].id, cart: [], addOns: new Set(), date: null, time: null,
    month: { y: now0.getUTCFullYear(), m: now0.getUTCMonth() },
    liveBusy: [], calStatus: B.calendarApiUrl ? "loading" : "", sent: null,
  };
  const services = {};
  B.categories.forEach((c) => c.services.forEach((s) => (services[s.id] = s)));

  // ---------- static content ----------
  function renderStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach((el) => { const v = S()[el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-c]").forEach((el) => (el.textContent = L(B[el.dataset.c])));
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    $("#hero-facts").innerHTML = [
      `${S().factDays} · ${fmtTime(toMin(B.dayStart))} – ${fmtTime(toMin(B.dayEnd))}`,
      esc(S().factHome),
      "ATH Móvil · PayPal · " + esc(S().payCash),
    ].map((t) => `<li class="chip">${t}</li>`).join("");
    $("#notes").innerHTML = L(B.notes).map((n) => `<li>${esc(n)}</li>`).join("");
    $("#about-text").innerHTML = L(B.about).map((p) => `<p>${esc(p)}</p>`).join("");
    $("#about-points").innerHTML = L(B.aboutPoints).map((p) => `<li>${esc(p)}</li>`).join("");
    $("#gallery").innerHTML = B.gallery.length
      ? `<h3>${esc(S().galleryTitle)}</h3><div class="gallery-grid">${B.gallery.map((g) =>
          `<figure><img src="${esc(g.src)}" alt="${esc(L(g.caption) || "")}" loading="lazy"><figcaption>${esc(L(g.caption) || "")}</figcaption></figure>`).join("")}</div>`
      : "";
    if (B.logo) document.querySelectorAll(".brand").forEach((el) => (el.innerHTML = `<img class="logo" src="${esc(B.logo)}" alt="${esc(B.name)}">`));
    const pays = ["ATH Móvil", "PayPal"].concat(B.payments.cash ? [S().payCash] : []);
    $("#paychips").innerHTML = `<span>${S().payWith}:</span>` + pays.map((p) => `<b>${esc(p)}</b>`).join("");
    const fp = $("#foot-phone"); fp.textContent = B.phoneDisplay; fp.href = `tel:+${B.whatsapp}`;
    $("#foot-email-wrap").hidden = !B.email; $("#send-email").hidden = !B.email;
    if (B.email) { const fe = $("#foot-email"); fe.textContent = B.email; fe.href = `mailto:${B.email}`; }
    const town = $("#town"), cur = town.value;
    town.innerHTML = `<option value="">${esc(S().fTownPick)}</option>` +
      B.municipalities.map((m) => `<option>${esc(m)}</option>`).join("") +
      `<option value="other">${esc(S().fTownOther)}</option>`;
    town.value = cur;
    const dows = [];
    for (let i = 0; i < 7; i++) dows.push(new Date(Date.UTC(2023, 0, 1 + i)).toLocaleDateString(locale(), { weekday: "short", timeZone: "UTC" }));
    $("#cal-dow").innerHTML = dows.map((d) => `<span>${esc(capital(d.replace(".", "")))}</span>`).join("");
    $("#tabs").innerHTML = B.categories.map((c) =>
      `<button role="tab" aria-selected="${c.id === state.tab}" data-tab="${c.id}">${esc(L(c.title))}</button>`).join("");
  }
  document.querySelector(".lang").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]"); if (!b) return;
    lang = b.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch (err) {}
    renderStatic(); update();
  });

  // ---------- services ----------
  function renderServices() {
    const cat = B.categories.find((c) => c.id === state.tab);
    $("#service-list").innerHTML = cat.services.map((s) => `
      <article class="card service">
        <div class="service-head"><h3>${esc(L(s.name))}</h3>${s.popular ? `<span class="badge badge-primary badge-sm shrink-0">${S().popular}</span>` : ""}</div>
        <p class="muted">${esc(L(s.desc))}</p>
        <ul class="opts">
          ${s.options.map((o, i) => {
            const inCart = state.cart.find((c) => c.serviceId === s.id && c.optIdx === i);
            return `<li>
              <span class="opt-label">${esc(L(o.label))}<small>${fmtDur(o.minutes)}</small></span>
              <span class="opt-price">${money(o.price)}${s.perItem ? `<small>${S().each}</small>` : ""}</span>
              <button class="add ${inCart ? "added" : ""}" data-add="${s.id}" data-opt="${i}">
                ${inCart ? (s.perItem ? `✓ ${inCart.qty}` : S().added) : S().add}</button>
            </li>`;
          }).join("")}
        </ul>
      </article>`).join("");
  }
  function renderAddOns() {
    $("#addon-list").innerHTML = B.addOns.map((a) => `
      <label class="addon ${state.addOns.has(a.id) ? "on" : ""}">
        <input type="checkbox" data-addon="${a.id}" ${state.addOns.has(a.id) ? "checked" : ""}>
        <span>${esc(L(a.name))}</span><strong>+${money(a.price)}</strong>
      </label>`).join("");
  }
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    state.tab = b.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-selected", x.dataset.tab === state.tab));
    renderServices();
  });
  $("#service-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    const s = services[b.dataset.add], optIdx = Number(b.dataset.opt);
    const existing = state.cart.find((c) => c.serviceId === s.id && c.optIdx === optIdx);
    if (existing && s.perItem) existing.qty++;
    else if (existing) { state.cart = state.cart.filter((c) => c !== existing); toast(S().removed); update(); return; }
    else state.cart.push({ key: `${s.id}:${optIdx}`, serviceId: s.id, optIdx, qty: 1 });
    toast(`+ ${L(s.name)} — ${L(s.options[optIdx].label)}`);
    update();
  });
  $("#addon-list").addEventListener("change", (e) => {
    const id = e.target.dataset.addon; if (!id) return;
    e.target.checked ? state.addOns.add(id) : state.addOns.delete(id);
    update();
  });

  // ---------- totals ----------
  const DEP_FROM = Number(B.depositFrom) || 0;
  function totals() {
    let price = 0, minutes = 0;
    state.cart.forEach((c) => { const o = services[c.serviceId].options[c.optIdx]; price += o.price * c.qty; minutes += o.minutes * c.qty; });
    if (state.cart.length) B.addOns.forEach((a) => { if (state.addOns.has(a.id)) { price += a.price; minutes += a.minutes; } });
    const deposit = price >= DEP_FROM ? Math.min(B.deposit, price) : 0;
    return { price, minutes, deposit, balance: price - deposit };
  }
  const whenText = () => state.date && state.time != null ? `${fmtDate(state.date)}, ${fmtTime(state.time)}` : state.date ? fmtDate(state.date) : "—";

  function renderCart() {
    $("#cart-empty").hidden = state.cart.length > 0;
    $("#cart").innerHTML = state.cart.map((c) => {
      const s = services[c.serviceId], o = s.options[c.optIdx];
      return `<li>
        <div><strong>${esc(L(s.name))}</strong><small>${esc(L(o.label))}</small></div>
        ${s.perItem ? `<span class="qty"><button data-q="-1" data-key="${c.key}" aria-label="−">−</button>${c.qty}<button data-q="1" data-key="${c.key}" aria-label="+">+</button></span>` : ""}
        <span class="line-price">${money(o.price * c.qty)}</span>
        <button class="remove" data-remove="${c.key}" aria-label="×">×</button>
      </li>`;
    }).join("") + (state.cart.length ? B.addOns.filter((a) => state.addOns.has(a.id)).map((a) =>
      `<li class="addon-line"><div>+ ${esc(L(a.name))}</div><span class="line-price">${money(a.price)}</span></li>`).join("") : "");
    const t = totals(), has = state.cart.length > 0;
    $("#sum-time").textContent = has ? `${S().about} ${fmtDur(t.minutes)}` : "—";
    $("#sum-total").textContent = has ? money(t.price) : "—";
    $("#sum-deposit").textContent = has ? (t.deposit ? money(t.deposit) : S().noDeposit) : money(B.deposit);
    $("#sum-balance").textContent = has ? money(t.balance) : "—";
    $("#sum-when").textContent = whenText();
    document.querySelector('#send-actions .fine').textContent = DEP_FROM > 0 ? S().fine(money(B.deposit), money(DEP_FROM)) : S().fineAll(money(B.deposit));
    $("#sticky-bar").classList.toggle("show", has && !state.sent);
    $("#sticky-text").textContent = has ? `${S().items(state.cart.reduce((n, c) => n + c.qty, 0))} · ${money(t.price)}` : "";
  }
  $("#cart").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"), r = e.target.closest("[data-remove]");
    if (q) { const c = state.cart.find((x) => x.key === q.dataset.key); c.qty += Number(q.dataset.q); if (c.qty < 1) state.cart = state.cart.filter((x) => x !== c); }
    if (r) state.cart = state.cart.filter((x) => x.key !== r.dataset.remove);
    update();
  });

  // ---------- availability ----------
  const dayLen = toMin(B.dayEnd) - toMin(B.dayStart);
  function dayOpen(ds) {
    const diff = daysBetween(todayPR(), ds);
    return diff >= 0 && diff <= B.bookAheadDays && B.workingDays.includes(utcDate(ds).getUTCDay()) && !B.daysOff.includes(ds);
  }
  function slotsFor(ds) {
    if (!dayOpen(ds)) return [];
    const need = Math.min(totals().minutes || 60, dayLen); // long jobs: offer a morning start and plan together
    const blocks = B.booked.concat(state.liveBusy).filter((b) => b.date === ds).map((b) => [toMin(b.from), toMin(b.to)]);
    const earliest = Date.now() + B.minNoticeHours * 3600000;
    const out = [];
    for (let t = toMin(B.dayStart); t + need <= toMin(B.dayEnd); t += B.slotStepMinutes) {
      if (utcDate(ds).getTime() + t * 60000 - OFF < earliest) continue;
      if (!blocks.some(([f, to]) => t < to + B.bufferMinutes && t + need + B.bufferMinutes > f)) out.push(t);
    }
    return out;
  }
  function renderCalendar() {
    const { y, m } = state.month;
    $("#cal-label").textContent = capital(new Date(Date.UTC(y, m, 1)).toLocaleDateString(locale(), { month: "long", year: "numeric", timeZone: "UTC" }));
    const first = new Date(Date.UTC(y, m, 1)).getUTCDay(), days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const today = todayPR();
    let html = "";
    for (let i = 0; i < first; i++) html += "<span></span>";
    for (let day = 1; day <= days; day++) {
      const ds = `${y}-${pad(m + 1)}-${pad(day)}`;
      const open = slotsFor(ds).length > 0, sel = ds === state.date, past = ds < today;
      html += `<button class="day ${open ? "open" : "closed"} ${sel ? "sel" : ""} ${past ? "past" : ""}" ${open ? "" : "disabled"} data-date="${ds}" aria-label="${esc(fmtDate(ds))}">${day}</button>`;
    }
    $("#cal-days").innerHTML = html;
    $("#cal-prev").disabled = y < now0.getUTCFullYear() || (y === now0.getUTCFullYear() && m <= now0.getUTCMonth());
    $("#cal-next").disabled = dsOf(new Date(Date.UTC(y, m + 1, 1))) > addDays(today, B.bookAheadDays);
    const st = $("#cal-status");
    st.className = "live " + state.calStatus;
    st.textContent = state.calStatus === "loading" ? S().calLoading : state.calStatus === "ok" ? S().calLive : state.calStatus === "err" ? S().calErr : "";
  }
  const shiftMonth = (n) => { const d = new Date(Date.UTC(state.month.y, state.month.m + n, 1)); state.month = { y: d.getUTCFullYear(), m: d.getUTCMonth() }; renderCalendar(); };
  $("#cal-prev").onclick = () => shiftMonth(-1);
  $("#cal-next").onclick = () => shiftMonth(1);
  $("#cal-days").addEventListener("click", (e) => {
    const b = e.target.closest("[data-date]"); if (!b || b.disabled) return;
    state.date = b.dataset.date; state.time = null; update();
  });

  const MAX_JOB = B.maxJobMinutes || 900;   // longest job one booking can hold
  function renderSlots() {
    const hint = $("#slot-hint"), box = $("#slots");
    if (!state.date) { hint.textContent = S().slotPickDay; box.innerHTML = ""; return; }
    const slots = slotsFor(state.date);
    if (state.time != null && !slots.includes(state.time)) state.time = null;
    const t = totals().minutes;
    if (t > MAX_JOB) { hint.textContent = S().tooBig(fmtDur(t), fmtDur(MAX_JOB)); box.innerHTML = ""; state.time = null; return; }
    hint.textContent = !state.cart.length ? S().slotNoCart(fmtDate(state.date))
      : t > dayLen ? S().slotLong(fmtDur(t)) : S().slotFit(fmtDate(state.date), fmtDur(t));
    box.innerHTML = slots.length
      ? slots.map((s) => `<button class="slot ${s === state.time ? "sel" : ""}" data-time="${s}">${fmtTime(s)}</button>`).join("")
      : `<p class="muted">${S().slotNone}</p>`;
  }
  $("#slots").addEventListener("click", (e) => {
    const b = e.target.closest("[data-time]"); if (!b) return;
    state.time = Number(b.dataset.time); update();
  });

  async function loadBusy() {
    if (!B.calendarApiUrl) return;
    state.calStatus = "loading"; renderCalendar();
    try {
      const r = await fetch(`${B.calendarApiUrl}?action=busy&days=${B.bookAheadDays + 1}`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "bad response");
      state.liveBusy = j.busy || [];
      state.calStatus = "ok";
    } catch (e) {
      state.calStatus = "err";
    }
    update();
  }

  // ---------- anti-spam: Cloudflare Turnstile (only when a site key is set) ----------
  let humanWidget = null;
  function startHuman() {
    if (!B.turnstileSiteKey || !B.calendarApiUrl) return;
    const box = $("#human"); box.hidden = false;
    window.onRedlineHuman = () => {
      humanWidget = window.turnstile.render("#human", { sitekey: B.turnstileSiteKey, theme: "dark", language: lang, appearance: "interaction-only" });
    };
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onRedlineHuman";
    s.async = true; s.defer = true; document.head.appendChild(s);
  }
  const humanToken = () => { try { return humanWidget !== null ? window.turnstile.getResponse(humanWidget) || "" : ""; } catch (e) { return ""; } };
  const resetHuman = () => { try { if (humanWidget !== null) window.turnstile.reset(humanWidget); } catch (e) {} };

  // ---------- send ----------
  const form = $("#details");
  const field = (n) => (new FormData(form).get(n) || "").toString().trim();
  function serviceLines() {
    return state.cart.map((c) => { const s = services[c.serviceId], o = s.options[c.optIdx];
      return `${L(s.name)} — ${L(o.label)}${c.qty > 1 ? ` × ${c.qty}` : ""} (${money(o.price * c.qty)})`; })
      .concat(B.addOns.filter((a) => state.addOns.has(a.id)).map((a) => `${S().msgAddon}: ${L(a.name)} (${money(a.price)})`));
  }
  function buildMessage(extra) {
    const t = totals(), town = field("town") === "other" ? S().fTownOther : field("town");
    const lines = [
      S().msgHi(B.name), "",
      `📅 ${fmtDate(state.date)} · ${fmtTime(state.time)}`, "",
      S().msgServices, ...serviceLines().map((l) => `• ${l}`), "",
      `${S().msgTotal}: ${money(t.price)} (${S().about} ${fmtDur(t.minutes)})`,
      t.deposit ? `${S().msgDeposit}: ${money(t.deposit)}` : S().msgNoDeposit, "",
      `${S().msgName}: ${field("name")}`,
      `${S().msgPhone}: ${field("phone")}`,
      `${S().msgAddr}: ${field("address")}, ${town}`,
    ];
    if (field("notes")) lines.push(`${S().msgNotes}: ${field("notes")}`);
    if (extra) lines.push("", extra);
    return lines.join("\n");
  }
  const waUrl = (extra) => `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(buildMessage(extra))}`;

  function validate() {
    let msg = "";
    if (!state.cart.length) msg = S().errCart;
    else if (totals().minutes > MAX_JOB) msg = S().tooBig(fmtDur(totals().minutes), fmtDur(MAX_JOB));
    else if (!state.date) msg = S().errDay;
    else if (state.time == null) msg = S().errTime;
    else {
      const bad = [...form.querySelectorAll("[required]")].find((i) => !i.value.trim());
      if (bad) { msg = S().errFields; bad.focus(); }
    }
    $("#form-error").textContent = msg;
    return !msg;
  }

  function paidBlock(t) {
    return `
      <p>${S().doneBody(esc(state.sent.when), money(t.deposit), B.depositHoursToPay)}</p>
      <div class="pay-opts">
        <div class="pay-opt"><span class="pay-name">ATH Móvil</span><strong>${esc(B.payments.athMovil)}</strong></div>
        ${B.payments.paypal
          ? `<a class="pay-opt pay-link" href="https://paypal.me/${encodeURIComponent(B.payments.paypal)}/${t.deposit}USD" target="_blank" rel="noopener"><span class="pay-name">PayPal</span><strong>${S().payBtn(money(t.deposit))} →</strong></a>`
          : `<div class="pay-opt"><span class="pay-name">PayPal</span><span>${S().payPaypalAsk}</span></div>`}
      </div>
      ${t.balance > 0 ? `<p>${S().payBalance(money(t.balance))}</p>` : ""}
`;
  }
  function showDone(viaApi) {
    const t = totals();
    state.sent = { when: whenText(), viaApi, wa: waUrl(viaApi && t.deposit ? S().msgReceipt : "") };
    const free = !t.deposit;
    $("#send-actions").hidden = true;
    const d = $("#done");
    d.hidden = false;
    d.innerHTML = `
      <div class="done-icon">✓</div>
      <h4>${viaApi ? S().doneTitleApi : S().doneTitleWa}</h4>
      ${free ? `<p>${S().doneBodyFree(esc(state.sent.when))}</p><p>${S().payOnDay(money(t.price))}</p>` : paidBlock(t)}
      <a class="btn btn-primary w-full" href="${state.sent.wa}" target="_blank" rel="noopener">${!viaApi ? S().doneWaAgain : free ? S().doneWaFree : S().doneWaBtn}</a>
      <button class="btn btn-ghost w-full mt-2" id="again">${S().doneAgain}</button>`;
    $("#sticky-bar").classList.remove("show");
    d.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("#done").addEventListener("click", (e) => {
    if (e.target.id !== "again") return;
    state.cart = []; state.addOns.clear(); state.date = null; state.time = null; state.sent = null;
    form.reset(); $("#done").hidden = true; $("#send-actions").hidden = false;
    loadBusy(); update();
    $("#prices").scrollIntoView({ behavior: "smooth" });
  });

  $("#send").onclick = async () => {
    if (!validate()) return;
    if (!B.calendarApiUrl) {               // no calendar connected: the WhatsApp message is the request
      window.open(waUrl(), "_blank", "noopener");
      showDone(false);
      return;
    }
    const btn = $("#send"); btn.disabled = true; btn.textContent = S().sending;
    const t = totals();
    const payload = {
      date: state.date, start: hhmm(state.time), minutes: t.minutes,
      name: field("name"), phone: field("phone"), address: field("address"),
      town: field("town") === "other" ? "Otro" : field("town"), notes: field("notes"),
      services: serviceLines(), total: t.price, deposit: t.deposit, lang, website: field("website"),
      turnstile: humanToken(),
    };
    try {
      const r = await fetch(B.calendarApiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (j.ok) { showDone(true); loadBusy(); resetHuman(); }
      else if (j.error === "taken") { state.time = null; await loadBusy(); $("#form-error").textContent = S().errTaken; resetHuman(); }
      else if (j.error === "captcha") { $("#form-error").textContent = S().errHuman; resetHuman(); }
      else throw new Error(j.error);
    } catch (e) {
      const code = e && e.message ? e.message : "network";
      $("#form-error").innerHTML = `${esc(S().errNet)} <a href="${waUrl()}" target="_blank" rel="noopener">WhatsApp</a> <small class="err-code">(${esc(code)})</small>`;
    } finally {
      btn.disabled = false; btn.textContent = S().send;
    }
  };
  $("#send-email").onclick = () => {
    if (!validate()) return;
    location.href = `mailto:${B.email}?subject=${encodeURIComponent(`${S().emailSubject} — ${whenText()}`)}&body=${encodeURIComponent(buildMessage())}`;
  };

  // ---------- misc ----------
  let toastTimer;
  function toast(text) {
    const el = $("#toast"); el.textContent = text; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }
  // ---------- hero: next open date ----------
  function nextOpening() {
    const today = todayPR();
    for (let i = 0; i <= B.bookAheadDays; i++) {
      const ds = addDays(today, i), s = slotsFor(ds);
      if (s.length) return { date: ds, time: s[0] };
    }
    return null;
  }
  function renderNext() {
    const n = nextOpening(), box = $("#next-slot"); if (!box) return;
    const wd = (ds) => capital(utcDate(ds).toLocaleDateString(locale(), { weekday: "long", timeZone: "UTC" }));
    const md = (ds) => utcDate(ds).toLocaleDateString(locale(), { day: "numeric", month: "long", timeZone: "UTC" });
    box.innerHTML = n
      ? `<span class="next-day">${esc(wd(n.date))}</span><span class="next-date">${esc(md(n.date))}</span><span class="next-time">${fmtTime(n.time)}</span>`
      : `<p class="muted">${esc(S().nextNone)}</p>`;
    $("#next-pick").hidden = !n;
    $("#next-pick").dataset.date = n ? n.date : "";
    const prices = B.categories.flatMap((c) => c.services.flatMap((s) => s.options.map((o) => o.price)));
    $("#from-price").textContent = money(Math.min(...prices));
    $("#hero-deposit").textContent = money(B.deposit);
    $("#hero-deposit-label").textContent = DEP_FROM > 0 ? S().depositHero(money(DEP_FROM)) : S().depositNow;
    $("#hero-hours").textContent = `${fmtTime(toMin(B.dayStart))}–${fmtTime(toMin(B.dayEnd))}`;
  }
  $("#next-pick").addEventListener("click", (e) => {
    const ds = e.currentTarget.dataset.date; if (!ds) return;
    const d = utcDate(ds);
    state.date = ds; state.time = null; state.month = { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    update();
    $("#book").scrollIntoView({ behavior: "smooth" });
  });

  function update() {
    renderServices(); renderAddOns(); renderCart(); renderCalendar(); renderSlots(); renderNext();
    if (state.cart.length || state.date) { const e = $("#form-error"); if (!e.querySelector("a")) e.textContent = ""; }
  }
  renderStatic(); update(); loadBusy(); startHuman();
})();
