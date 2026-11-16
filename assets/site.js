/* RedlineHQ shared script: contact details, language switch, copy buttons, toast. */
(function () {
  "use strict";

  // One place for contact details used across every page.
  const SITE = (window.SITE = {
    name: "RedlineHQ",
    domain: "redlinehq.work",
    whatsapp: "17879100777",          // country code + number, digits only
    phone: "(787) 910-0777",
    email: "citas@redlinehq.work",
    area: { es: "Área Metropolitana, Puerto Rico", en: "San Juan Metro Area, Puerto Rico" },
  });

  const root = document.documentElement;
  const read = () => { try { return localStorage.getItem("lang"); } catch (e) { return null; } };
  const save = (l) => { try { localStorage.setItem("lang", l); } catch (e) {} };

  function applyLang(l) {
    root.dataset.lang = l;
    root.lang = l;
    document.querySelectorAll(".lang [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    // attributes that can't hold two <span>s
    document.querySelectorAll("[data-ph-es]").forEach((el) => { el.placeholder = l === "es" ? el.dataset.phEs : el.dataset.phEn; });
    document.querySelectorAll("[data-title-es]").forEach((el) => { document.title = l === "es" ? el.dataset.titleEs : el.dataset.titleEn; });
    document.dispatchEvent(new CustomEvent("redline:lang", { detail: l }));
  }
  window.redlineLang = () => root.dataset.lang || "es";

  document.addEventListener("click", (e) => {
    const b = e.target.closest(".lang [data-lang]");
    if (b) { save(b.dataset.lang); applyLang(b.dataset.lang); }
  });

  // contact details
  const waLink = (text) => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  window.redlineWa = waLink;
  function fillContacts() {
    document.querySelectorAll('[data-site="phone"]').forEach((el) => (el.textContent = SITE.phone));
    document.querySelectorAll('[data-site="email"]').forEach((el) => (el.textContent = SITE.email));
    document.querySelectorAll('[data-site="area"]').forEach((el) => (el.textContent = SITE.area[window.redlineLang()]));
    document.querySelectorAll("a[data-wa]").forEach((a) => {
      const l = window.redlineLang();
      a.href = waLink(a.getAttribute(`data-wa-${l}`) || a.dataset.wa || "");
      a.target = "_blank"; a.rel = "noopener";
    });
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }
  document.addEventListener("redline:lang", fillContacts);

  // copy buttons: <button data-copy="text">
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const text = b.dataset.copy === "phone" ? SITE.phone : b.dataset.copy === "email" ? SITE.email : b.dataset.copy;
    const done = () => toast(window.redlineLang() === "es" ? `Copiado: ${text}` : `Copied: ${text}`);
    try { await navigator.clipboard.writeText(text); done(); }
    catch (err) {
      const t = b.closest("[data-copy-wrap]")?.querySelector("[data-site]");
      if (t) { const r = document.createRange(); r.selectNodeContents(t); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast(window.redlineLang() === "es" ? "Selecciona y copia el texto" : "Select and copy the text");
    }
  });

  let timer;
  function toast(text) {
    let el = document.getElementById("toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = text; el.classList.add("show");
    clearTimeout(timer); timer = setTimeout(() => el.classList.remove("show"), 1800);
  }
  window.redlineToast = toast;

  applyLang(read() || root.dataset.lang || "es");
})();
