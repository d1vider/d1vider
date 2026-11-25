/*
 * ============================================================
 *  REDLINE PORTFOLIO: your finished work
 *  To add a project, copy one { … } block, change the text, and
 *  put its photos in the portfolio/img folder.
 *
 *  category: "interiors" | "tech" | "web"
 *  date:     "YYYY-MM"
 *  Photos, pick one style:
 *    image:  "img/my-photo.webp"                          one photo
 *    before: "img/x-before.jpg", after: "img/x-after.jpg"  before/after slider (best for detailing)
 *      + sideBySide: true   two photos next to each other (when the angles differ)
 *  gallery (optional): [{ src, caption }] extra photos shown as thumbnails
 *  draft: true  hides the project; see it at /portfolio/?preview. Delete the line to publish.
 *  link (optional): a page to open, with linkLabel
 * ============================================================
 */
window.PROJECTS = [
  {
    id: "kia-forte-floor",
    category: "interiors",
    date: "2026-11",
    title: { es: "Kia Forte: alfombra completa, asientos fuera", en: "Kia Forte: full carpet, seats out" },
    summary: {
      es: "Saqué los asientos delanteros para llegar a todo lo que el aspirado normal no alcanza: monedas, arena y migas debajo de los asientos. Aspirado profundo, cepillo rotativo en la alfombra y extracción.",
      en: "I took the front seats out to reach everything a normal vacuum misses: coins, sand and crumbs under the seats. Deep vacuum, rotary brush on the carpet and extraction.",
    },
    tags: [{ es: "Asientos fuera", en: "Seats out" }, { es: "Cepillo rotativo", en: "Rotary brush" }, { es: "Extracción", en: "Extraction" }],
    before: "img/kia-driver-before.webp",
    after: "img/kia-driver-after.webp",
    sideBySide: true,          // the two photos were taken from different angles
    gallery: [
      { src: "img/kia-floor-before.webp", caption: { es: "Antes: el piso con los asientos fuera, con monedas y arena", en: "Before: the floor with the seats out, coins and sand" } },
      { src: "img/kia-floor-after.webp", caption: { es: "Después: el mismo piso, limpio", en: "After: the same floor, clean" } },
      { src: "img/kia-carpet-closeup.webp", caption: { es: "Antes: la arena que se acumula debajo del asiento", en: "Before: the sand that builds up under the seat" } },
      { src: "img/kia-drill-brush.webp", caption: { es: "Cepillo rotativo para soltar la suciedad de la alfombra", en: "Rotary brush to loosen dirt from the carpet" } },
      { src: "img/kia-rear-floor-after.webp", caption: { es: "Después: la alfombra limpia, todavía sin asientos", en: "After: clean carpet, seats still out" } },
      { src: "img/kia-rear-finished.webp", caption: { es: "Terminado: asientos traseros", en: "Finished: back seats" } },
    ],
  },
  {
    id: "redlinehq",
    category: "web",
    date: "2026-11",
    title: { es: "RedlineHQ", en: "RedlineHQ" },
    summary: {
      es: "Sitio central de la marca con tres secciones, bilingüe, modo claro y oscuro, el logo adaptado y un tacómetro animado.",
      en: "The brand's home site: three sections, bilingual, light and dark mode, the adapted logo and an animated tachometer.",
    },
    tags: ["React", "Tailwind", "daisyUI", { es: "Bilingüe", en: "Bilingual" }],
    image: "img/redlinehq.webp",
    link: "../",
    linkLabel: { es: "Ver sitio", en: "View site" },
  },
  {
    id: "interiors-booking",
    category: "web",
    date: "2026-11",
    title: { es: "Sistema de citas de Redline Interiors", en: "Redline Interiors booking system" },
    summary: {
      es: "Precios, calendario que solo ofrece horas donde cabe el trabajo completo, depósito por ATH Móvil o PayPal, y solicitudes por WhatsApp o email con invitación para Apple Calendar.",
      en: "Prices, a calendar that only offers times where the whole job fits, deposits by ATH Móvil or PayPal, and requests by WhatsApp or email with an Apple Calendar invite.",
    },
    tags: [{ es: "Citas", en: "Bookings" }, "Apple Calendar", "ATH Móvil", "PayPal"],
    image: "img/interiors.webp",
    link: "../interiors/",
    linkLabel: { es: "Probar el sistema", en: "Try it" },
    requiresInteriors: true,   // link hidden while Interiors is closed (open: false)
  },
  {
    id: "domain-email",
    category: "tech",
    date: "2026-11",
    title: { es: "Dominio y email profesional", en: "Domain and business email" },
    summary: {
      es: "Registro de redlinehq.work y conexión a iCloud+ con registros MX, SPF y DKIM, para tener citas@redlinehq.work en el iPhone y la Mac.",
      en: "Registered redlinehq.work and connected it to iCloud+ with MX, SPF and DKIM records, putting citas@redlinehq.work on iPhone and Mac.",
    },
    tags: ["DNS", "iCloud+", "Porkbun"],
    visual: "dns",
  },
];
