/*
 * ============================================================
 *  REDLINE INTERIORS — business settings
 *  Edit this file to change anything clients see.
 *  Text written as { es: "...", en: "..." } shows in the
 *  language the client picks (Spanish is the default).
 * ============================================================
 */
window.BUSINESS = {
  name: "Redline Interiors",
  logo: "",                         // e.g. "images/logo.png", which replaces the text logo in the header
  tagline: {
    es: "Detallado interior a domicilio para autos y muebles",
    en: "Mobile interior detailing for cars & home furniture",
  },
  area: {
    es: "Área Metropolitana, Puerto Rico",
    en: "San Juan Metro Area, Puerto Rico",
  },
  defaultLang: "es",

  // ---------- CONTACT ----------
  whatsapp: "17879100777",          // country code 1 + number, digits only
  phoneDisplay: "(787) 910-0777",
  email: "citas@redlinehq.work",

  // ---------- GOOGLE CALENDAR ----------
  // Paste your Google Apps Script "Web app" URL here (see README, step "Google Calendar").
  // When set: the calendar shows your real free/busy times from Google Calendar,
  // and every booking request is added to your calendar automatically.
  calendarApiUrl: "https://script.google.com/macros/s/AKfycbx0dazkCuiWoh8byf6ysv5DO0M8u0iex6pcObTabuPhgXwu9QudvwycvWgW6KzLr0YItA/exec",

  // ---------- ANTI-SPAM (Cloudflare Turnstile) ----------
  // Paste your Turnstile *Site Key* here to turn on the "are you human" check.
  // Leave empty to keep it off. (The *Secret Key* goes in the Google script, never here.)
  turnstileSiteKey: "0x4AAAAAAGD4JJrfq1bobDoD",

  // ---------- DEPOSIT ----------
  currency: "$",
  deposit: 100,                     // never more than the job total
  // How clients can pay. Deposit: ATH Móvil or PayPal. Balance: any of the three.
  payments: {
    athMovil: "(787) 910-0777",
    paypal: "jcnussa",              // your paypal.me name, e.g. "redlinepr" for paypal.me/redlinepr
    cash: true,
  },
  depositHoursToPay: 24,

  // ---------- SCHEDULE (Puerto Rico time) ----------
  utcOffsetHours: -4,               // Puerto Rico is UTC-4 all year (no daylight saving)
  workingDays: [1, 2, 3, 4, 5, 6],  // 0 = Sun ... 6 = Sat
  dayStart: "08:00",
  dayEnd: "18:00",
  slotStepMinutes: 30,
  bufferMinutes: 45,                // travel time between jobs
  bookAheadDays: 45,
  minNoticeHours: 24,
  maxJobMinutes: 900,       // longest job one booking can be (15 h); bigger jobs are asked to WhatsApp you
  daysOff: ["2026-12-24", "2026-12-25", "2026-12-31", "2027-01-01", "2027-01-06"],
  // Only needed if you are NOT using Google Calendar:
  booked: [],

  // ---------- SERVICE AREA ----------
  municipalities: [
    "San Juan", "Bayamón", "Carolina", "Guaynabo", "Cataño",
    "Trujillo Alto", "Toa Baja", "Toa Alta",
  ],

  // ---------- ABOUT ----------
  about: {
    es: [
      "Me apasionan los carros y estoy creciendo como detallista. Redline Interiors nació de algo simple: me gusta ver un interior quedar como nuevo, y me gusta todavía más ver la cara del cliente cuando abre la puerta.",
      "Trabajo a domicilio en el Área Metropolitana con equipo de extracción, vapor y productos seguros para tu familia y tus mascotas. Cada trabajo lo hago personalmente, con calma y atención al detalle, sin prisa y sin atajos.",
      "Estoy empezando y cada cliente cuenta. Si algo no queda como esperabas, dímelo y lo arreglo.",
    ],
    en: [
      "I'm a car enthusiast and an up-and-coming interior detailer. Redline Interiors started from something simple: I love seeing an interior come back to life, and I love seeing the owner's face when they open the door even more.",
      "I come to you anywhere in the San Juan metro area with extraction, steam and products that are safe for your family and pets. I do every job myself, carefully and without shortcuts.",
      "I'm building this business one client at a time, so every job counts. If something isn't right, tell me and I'll make it right.",
    ],
  },
  aboutPoints: {
    es: ["Servicio a domicilio", "Productos seguros para niños y mascotas", "Precio claro antes de empezar"],
    en: ["I come to you", "Kid- and pet-safe products", "Clear price before I start"],
  },

  // Before/after photos. Put image files in an "images" folder next to this file,
  // then add lines like: { src: "images/civic-before-after.jpg", caption: { es: "...", en: "..." } }
  gallery: [],

  // ---------- SERVICES & PRICES ----------
  categories: [
    {
      id: "car",
      title: { es: "Interior de Auto", en: "Car Interior" },
      services: [
        {
          id: "car-basic",
          name: { es: "Limpieza Interior Básica", en: "Basic Interior Clean" },
          desc: {
            es: "Aspirado completo, limpieza de tablero y consola, paneles de puertas, cristales interiores y alfombras.",
            en: "Full vacuum, dashboard & console wipe-down, door panels, interior glass, floor mats.",
          },
          perItem: true,
          options: [
            { label: { es: "Sedán / Coupé", en: "Sedan / Coupe" }, price: 90, minutes: 90 },
            { label: { es: "SUV / Pickup", en: "SUV / Truck" }, price: 115, minutes: 105 },
            { label: { es: "Minivan / 3 filas", en: "Minivan / 3-row" }, price: 135, minutes: 120 },
          ],
        },
        {
          id: "car-full",
          name: { es: "Detallado Interior Completo", en: "Full Interior Detail" },
          desc: {
            es: "Todo lo de la básica, más extracción con agua caliente de asientos y alfombras, vapor en ventilas y rincones, y limpieza e hidratación de cuero.",
            en: "Everything in Basic, plus hot-water extraction of seats & carpets, steam-cleaned vents & crevices, leather clean & condition.",
          },
          popular: true,
          perItem: true,
          options: [
            { label: { es: "Sedán / Coupé", en: "Sedan / Coupe" }, price: 195, minutes: 210 },
            { label: { es: "SUV / Pickup", en: "SUV / Truck" }, price: 235, minutes: 240 },
            { label: { es: "Minivan / 3 filas", en: "Minivan / 3-row" }, price: 265, minutes: 270 },
          ],
        },
        {
          id: "car-shampoo",
          name: { es: "Champú de Asientos y Alfombras", en: "Seats & Carpet Shampoo" },
          desc: {
            es: "Extracción profunda de asientos de tela, alfombras y mats. Saca manchas, derrames y sucio pegado.",
            en: "Deep extraction of fabric seats, carpets and mats. Lifts stains, spills and ground-in dirt.",
          },
          perItem: true,
          options: [
            { label: { es: "Sedán / Coupé", en: "Sedan / Coupe" }, price: 125, minutes: 120 },
            { label: { es: "SUV / Pickup", en: "SUV / Truck" }, price: 145, minutes: 135 },
            { label: { es: "Minivan / 3 filas", en: "Minivan / 3-row" }, price: 165, minutes: 150 },
          ],
        },
      ],
    },
    {
      id: "home",
      title: { es: "Muebles del Hogar", en: "Home Furniture" },
      services: [
        {
          id: "sofa",
          name: { es: "Sofá / Mueble", en: "Sofa / Couch" },
          desc: {
            es: "Extracción con agua caliente o limpieza de baja humedad según la tela. Cojines, brazos, espaldar y faldón.",
            en: "Hot-water extraction or low-moisture clean depending on fabric. Cushions, arms, back and skirt.",
          },
          popular: true,
          perItem: true,
          options: [
            { label: { es: "Loveseat (2 puestos)", en: "Loveseat (2 seats)" }, price: 100, minutes: 75 },
            { label: { es: "Sofá (3 puestos)", en: "Sofa (3 seats)" }, price: 135, minutes: 90 },
            { label: { es: "Seccional (5–6 puestos)", en: "Sectional (5–6 seats)" }, price: 205, minutes: 150 },
          ],
        },
        {
          id: "armchair",
          name: { es: "Butaca / Reclinable", en: "Armchair / Recliner" },
          desc: { es: "Limpieza profunda de una butaca o reclinable tapizado.", en: "Deep clean of a single upholstered chair or recliner." },
          perItem: true,
          options: [
            { label: { es: "Butaca", en: "Armchair" }, price: 55, minutes: 40 },
            { label: { es: "Reclinable", en: "Recliner" }, price: 70, minutes: 50 },
          ],
        },
        {
          id: "mattress",
          name: { es: "Colchón", en: "Mattress" },
          desc: {
            es: "Aspirado, tratamiento de manchas, extracción y desodorizado. Ambos lados si lo pides.",
            en: "Vacuum, stain treatment, extraction and deodorising. Both sides on request.",
          },
          perItem: true,
          options: [
            { label: { es: "Individual / Twin", en: "Single / Twin" }, price: 80, minutes: 45 },
            { label: { es: "Full / Queen", en: "Full / Queen" }, price: 100, minutes: 60 },
            { label: { es: "King", en: "King" }, price: 125, minutes: 70 },
          ],
        },
        {
          id: "rug",
          name: { es: "Alfombra de Área", en: "Area Rug" },
          desc: { es: "Limpieza profunda en sitio para alfombras sintéticas y de mezcla de lana.", en: "On-site deep clean for synthetic and wool-blend rugs." },
          perItem: true,
          options: [
            { label: { es: "Pequeña (hasta 5×7 pies)", en: "Small (up to 5×7 ft)" }, price: 80, minutes: 45 },
            { label: { es: "Grande (hasta 8×10 pies)", en: "Large (up to 8×10 ft)" }, price: 125, minutes: 75 },
          ],
        },
        {
          id: "dining",
          name: { es: "Sillas de Comedor", en: "Dining Chairs" },
          desc: { es: "Limpieza del asiento (y espaldar) tapizado, por silla.", en: "Upholstered seat (and back) cleaning, priced per chair." },
          perItem: true,
          options: [
            { label: { es: "Solo asiento", en: "Seat only" }, price: 25, minutes: 12 },
            { label: { es: "Asiento y espaldar", en: "Seat & back" }, price: 35, minutes: 18 },
          ],
        },
      ],
    },
  ],

  addOns: [
    { id: "pet", name: { es: "Remoción de pelo de mascota", en: "Pet hair removal" }, price: 50, minutes: 30 },
    { id: "odor", name: { es: "Tratamiento de olores", en: "Odour treatment" }, price: 60, minutes: 30 },
    { id: "stain", name: { es: "Manchas difíciles", en: "Heavy stain treatment" }, price: 45, minutes: 20 },
    { id: "protect", name: { es: "Protector de telas", en: "Fabric protector coating" }, price: 55, minutes: 20 },
  ],

  notes: {
    es: [
      "Los precios son tarifas base. Si algo está muy sucio puede costar más, y te confirmo el precio final antes de empezar.",
      "Voy a donde estés. Solo necesito acceso a un enchufe y, para autos, un sitio cerca donde estacionar.",
      "Tu cita queda separada cuando recibo el depósito. El depósito se descuenta del total.",
      "Aceptamos ATH Móvil, PayPal y efectivo. El depósito se paga por ATH Móvil o PayPal; el balance, como prefieras el día del servicio.",
      "¿Necesitas cancelar o mover la cita? Avísame con al menos 24 horas y te devuelvo el depósito o lo paso a la nueva fecha.",
    ],
    en: [
      "Prices are starting rates. Heavily soiled items may cost more, and I'll confirm the final price before starting.",
      "I come to you. I just need access to a power outlet and, for cars, a spot to park nearby.",
      "Your time is secured once I receive the deposit. The deposit comes off your total.",
      "I take ATH Móvil, PayPal and cash. The deposit is paid by ATH Móvil or PayPal; the balance however you like on the day.",
      "Need to cancel or move? Give me at least 24 hours' notice and I'll refund the deposit or move it to your new date.",
    ],
  },
};
