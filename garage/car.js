/*
 * ============================================================
 *  REDLINE GARAGE: your car
 *  Edit the text and the mod list here. No rebuild needed.
 *  soon: true  shows a "Próximamente" badge on a mod that's on the way.
 *  instagram / pinkslip: paste the full links; empty "" hides the button.
 * ============================================================
 */
window.CAR = {
  draft: true,   // hidden page: no menu link, and search engines are told to skip it. Set to false to publish.
  year: 2023,
  make: "Hyundai",
  model: "Kona N",
  color: { es: "Cyber Grey", en: "Cyber Grey" },
  tagline: {
    es: "El carro detrás de RedlineHQ. De aquí salen los colores de la marca y las ganas de cuidar cada interior como si fuera el mío.",
    en: "The car behind RedlineHQ. It's where the brand colors come from, and why I treat every interior like it's my own.",
  },
  instagram: "",   // e.g. "https://instagram.com/yourname"
  pinkslip: "https://pinkslips.app/r3dline-n",

  hero: "img/kona-front.webp",
  photos: [
    { src: "img/kona-front.webp", caption: { es: "De frente", en: "Head on" } },
    { src: "img/kona-3q.webp", caption: { es: "Tres cuartos", en: "Three-quarter" } },
    { src: "img/kona-wheel.webp", caption: { es: "Lip kit y frenos rojos", en: "Lip kit and red calipers" } },
    { src: "img/kona-rear-3q.webp", caption: { es: "Spoiler extender y difusor", en: "Spoiler extender and diffuser" } },
    { src: "img/kona-rear.webp", caption: { es: "Escape AFE Takeda y difusor", en: "AFE Takeda exhaust and diffuser" } },
    { src: "img/kona-wheel-rear.webp", caption: { es: "Perfil trasero", en: "Rear profile" } },
    { src: "img/kona-lot.webp", caption: { es: "Lip kit y acentos rojos", en: "Lip kit and red accents" } },
    { src: "img/kona-meet.webp", caption: { es: "En línea con otros Kona N", en: "Lined up with other Kona Ns" } },
    { src: "img/kona-night.webp", caption: { es: "De noche, con el kit de luces", en: "At night, lit up" } },
  ],

  mods: [
    { group: { es: "Motor", en: "Engine" }, items: [
      { name: "Woosh Motorsport Inlet" },
      { name: "Sonata HPFP" },
      { name: "HKS Heat 9 Spark Plugs (.0022)" },
      { name: "Forge Intake" },
      { name: "Woosh Ignition Coils" },
      { name: "HKS SQ4 BoV" },
      { name: "ADD W1 Catch Can" },
      { name: "Vega Motorworks Engine Cover" },
      { name: "Airtec Intercooler" },
      { name: "RVE 4\" Downpipe", soon: true },
      { name: "RVE R450", soon: true },
      { name: "AFE Takeda Catback" },
    ] },
    { group: { es: "Suspensión", en: "Suspension & handling" }, items: [
      { name: "Eibach Lowering Kit" },
      { name: "Titan SP-3 Coilovers", soon: true },
    ] },
    { group: { es: "Interior", en: "Interior" }, items: [
      { name: "Zestek SCX Hub" },
      { name: "Triple Seven Steering Wheel" },
      { name: "Billetworkz Hybrid Shift Knob" },
      { name: "Glowride Ambient Light Kit" },
    ] },
    { group: { es: "Exterior", en: "Exterior" }, items: [
      { name: "Maxton Design Lip Kit" },
      { name: "Badgeskins Red Accents + DRL Slotted Tints" },
      { name: "Epsilon+ Spoiler Extender" },
      { name: "Velossa Tech Lit Kit" },
      { name: "Boostlabs AU Lit N Logo" },
    ] },
    { group: { es: "Fluidos", en: "Fluids" }, items: [
      { name: "Liqui Moly 5W-40" },
    ] },
  ],
};
