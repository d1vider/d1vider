/*
 * Floating WhatsApp button, on every page except /links/ (which has its own).
 * Opens a chat with a message that says which page the visitor came from.
 * The number comes from interiors/config.js (whatsapp), with a fallback below.
 */
(function () {
  "use strict";
  if (/^\/links\//.test(location.pathname)) return;
  const NUMBER = (window.BUSINESS && window.BUSINESS.whatsapp) || "17879100777";
  const MSG = {
    tech: { es: "¡Hola! Vi Redline Technologies y tengo una pregunta.", en: "Hi! I saw Redline Technologies and have a question." },
    interiors: { es: "¡Hola! Me interesa Redline Interiors.", en: "Hi! I'm interested in Redline Interiors." },
    portfolio: { es: "¡Hola! Vi tu portafolio y quiero información.", en: "Hi! I saw your portfolio and would like more info." },
    garage: { es: "¡Hola! Vi el Kona N en el Garage.", en: "Hi! I saw the Kona N in the Garage." },
    home: { es: "¡Hola! Vi RedlineHQ y tengo una pregunta.", en: "Hi! I saw RedlineHQ and have a question." },
  };
  const page = (location.pathname.split("/")[1] || "home");
  const lang = () => {
    const d = document.documentElement;
    const l = d.dataset.lang || d.lang || (function () { try { return localStorage.getItem("lang"); } catch (e) { return null; } })();
    return l === "en" ? "en" : "es";
  };
  const href = () => `https://wa.me/${NUMBER}?text=${encodeURIComponent((MSG[page] || MSG.home)[lang()])}`;

  const css = document.createElement("style");
  css.textContent = `
    .wa-float { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 45;
      display: flex; align-items: center; gap: 8px; height: 56px; padding: 0 16px; border-radius: 999px; background: #1fae55; color: #fff;
      font: 600 15px/1 Inter, system-ui, sans-serif; text-decoration: none; box-shadow: 0 10px 30px rgba(0,0,0,.25), 0 2px 6px rgba(0,0,0,.15);
      transition: transform .2s, box-shadow .2s, bottom .25s; -webkit-tap-highlight-color: transparent; }
    .wa-float:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(0,0,0,.3); }
    .wa-float:active { transform: scale(.96); }
    .wa-float:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
    .wa-float svg { width: 26px; height: 26px; flex: none; }
    .wa-float .wa-label { white-space: nowrap; }
    @media (max-width: 639px) { .wa-float { width: 56px; padding: 0; justify-content: center; } .wa-float .wa-label { display: none; } }
    body:has(.sticky-bar.show) .wa-float { bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
    @media print { .wa-float { display: none; } }
  `;
  document.head.appendChild(css);

  const a = document.createElement("a");
  a.className = "wa-float";
  a.target = "_blank"; a.rel = "noopener";
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z"/></svg><span class="wa-label"></span>';
  const update = () => {
    const l = lang();
    a.href = href();
    a.querySelector(".wa-label").textContent = l === "en" ? "Message me" : "Escríbeme";
    a.setAttribute("aria-label", l === "en" ? "Message me on WhatsApp" : "Escríbeme por WhatsApp");
  };
  a.addEventListener("click", update);      // language may have changed since the page loaded
  document.addEventListener("redline:lang", update);
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-lang"] });
  const mount = () => { update(); document.body.appendChild(a); };
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
