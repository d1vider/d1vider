/*
 * ============================================================
 *  YOUR BUSINESS SETTINGS — edit this file, nothing else needed
 * ============================================================
 *  Everything clients see (name, prices, working days, hours,
 *  blocked times) comes from here. Save, re-upload, done.
 */
window.BUSINESS = {
  name: "Fresh Interior Detailing",            // <- your business name
  tagline: "Mobile interior detailing for cars & home furniture",
  area: "Serving your city & surrounding areas", // <- where you work

  // Where booking requests are sent. Use digits only for WhatsApp,
  // with country code and no "+" (e.g. "15551234567").
  whatsapp: "15550000000",                     // <- your WhatsApp number
  email: "bookings@example.com",               // <- your booking email
  phoneDisplay: "+1 (555) 000-0000",           // <- shown on the page

  currency: "$",

  // ---------- SCHEDULE ----------
  // 0 = Sunday, 1 = Monday ... 6 = Saturday
  workingDays: [1, 2, 3, 4, 5, 6],             // Mon–Sat
  dayStart: "08:00",
  dayEnd: "18:00",
  slotStepMinutes: 30,       // how often start times are offered
  bufferMinutes: 30,         // travel / setup time between jobs
  bookAheadDays: 45,         // how far ahead clients can book
  minNoticeHours: 24,        // no same-day surprise bookings

  // Whole days you're not working (holidays, vacation)
  daysOff: ["2026-12-24", "2026-12-25", "2026-12-31", "2027-01-01"],

  // Times you're already booked. Add a line each time you confirm a job,
  // so clients can't pick that time. Format: date, from, to (24h).
  booked: [
    { date: "2026-11-18", from: "09:00", to: "13:00" },
    { date: "2026-11-20", from: "13:00", to: "17:00" },
  ],

  // ---------- SERVICES & PRICES ----------
  // Each service has options (size/type). price = per item when perItem is true.
  // minutes = how long the job takes you (used to find free time slots).
  categories: [
    {
      id: "car",
      title: "Car Interior",
      icon: "🚗",
      services: [
        {
          id: "car-basic",
          name: "Basic Interior Clean",
          desc: "Full vacuum, dashboard & console wipe-down, door panels, interior glass, floor mats.",
          options: [
            { label: "Sedan / Coupe", price: 80, minutes: 90 },
            { label: "SUV / Truck", price: 100, minutes: 105 },
            { label: "Minivan / 3-row", price: 120, minutes: 120 },
          ],
        },
        {
          id: "car-full",
          name: "Full Interior Detail",
          desc: "Everything in Basic, plus hot-water extraction of seats & carpets, steam-cleaned vents & crevices, leather clean & condition.",
          popular: true,
          options: [
            { label: "Sedan / Coupe", price: 180, minutes: 210 },
            { label: "SUV / Truck", price: 220, minutes: 240 },
            { label: "Minivan / 3-row", price: 250, minutes: 270 },
          ],
        },
        {
          id: "car-shampoo",
          name: "Seats & Carpet Shampoo",
          desc: "Deep extraction of fabric seats, carpets and mats. Lifts stains, spills and ground-in dirt.",
          options: [
            { label: "Sedan / Coupe", price: 110, minutes: 120 },
            { label: "SUV / Truck", price: 130, minutes: 135 },
            { label: "Minivan / 3-row", price: 150, minutes: 150 },
          ],
        },
      ],
    },
    {
      id: "home",
      title: "Home Furniture",
      icon: "🛋️",
      services: [
        {
          id: "sofa",
          name: "Sofa / Couch Cleaning",
          desc: "Hot-water extraction or low-moisture clean depending on fabric. Cushions, arms, back and skirt.",
          popular: true,
          options: [
            { label: "Loveseat (2 seats)", price: 90, minutes: 75 },
            { label: "Sofa (3 seats)", price: 120, minutes: 90 },
            { label: "Sectional (5–6 seats)", price: 190, minutes: 150 },
          ],
        },
        {
          id: "armchair",
          name: "Armchair / Recliner",
          desc: "Deep clean of a single upholstered chair or recliner.",
          perItem: true,
          options: [
            { label: "Armchair", price: 45, minutes: 40 },
            { label: "Recliner", price: 60, minutes: 50 },
          ],
        },
        {
          id: "mattress",
          name: "Mattress Cleaning",
          desc: "Vacuum, stain treatment, extraction and deodorising. Both sides on request.",
          perItem: true,
          options: [
            { label: "Single / Twin", price: 70, minutes: 45 },
            { label: "Double / Queen", price: 90, minutes: 60 },
            { label: "King", price: 110, minutes: 70 },
          ],
        },
        {
          id: "rug",
          name: "Area Rug Cleaning",
          desc: "On-site deep clean for synthetic and wool-blend rugs.",
          perItem: true,
          options: [
            { label: "Small (up to 5×7 ft)", price: 70, minutes: 45 },
            { label: "Large (up to 8×10 ft)", price: 110, minutes: 75 },
          ],
        },
        {
          id: "dining",
          name: "Dining Chairs",
          desc: "Upholstered seat (and back) cleaning, priced per chair.",
          perItem: true,
          options: [
            { label: "Seat only", price: 15, minutes: 12 },
            { label: "Seat & back", price: 25, minutes: 18 },
          ],
        },
      ],
    },
  ],

  // Extras clients can add to any booking
  addOns: [
    { id: "pet", name: "Pet hair removal", price: 40, minutes: 30 },
    { id: "odor", name: "Odour treatment / deodorise", price: 50, minutes: 30 },
    { id: "stain", name: "Heavy stain treatment", price: 35, minutes: 20 },
    { id: "protect", name: "Fabric protector coating", price: 45, minutes: 20 },
  ],

  notes: [
    "Prices are starting rates. Heavily soiled items may cost more. I'll confirm the final price before starting.",
    "I come to you. Please have access to a power outlet and (for cars) a spot to park nearby.",
    "Your booking is a request until I confirm it by message, usually within a few hours.",
    "Need to cancel or move? Please give at least 24 hours' notice.",
  ],
};
