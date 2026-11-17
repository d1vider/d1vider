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
 *  link (optional): a page to open, with linkLabel
 * ============================================================
 */
window.PROJECTS = [
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
