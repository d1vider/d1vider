import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Armchair, Cpu, Images, Sun, Moon, MapPin, CalendarCheck, MessageCircle, ShieldCheck, Sparkles, Phone, Mail, ChevronRight, Wrench, Monitor, Code, BadgeCheck } from "lucide-react";

const SITE = { whatsapp: "17879100777", phone: "(787) 910-0777", email: "citas@redlinehq.work" };
const B = window.BUSINESS || { categories: [], municipalities: [], notes: { es: [], en: [] }, currency: "$", deposit: 100, minNoticeHours: 24 };

const T = {
  es: {
    nav: { book: "Reservar" },
    pill: ["Nuevo", "Citas en línea con depósito por ATH Móvil"],
    h1a: "Cada trabajo, hasta la", h1b: "línea roja.",
    lead: "Detallado interior a domicilio, soluciones de tecnología y páginas web. Todo bajo una misma marca, en el Área Metropolitana de Puerto Rico.",
    ctaBook: "Reservar detallado", ctaQuote: "Pedir cotización",
    trust: ["Área Metropolitana", "Español e inglés", "ATH Móvil · PayPal · Efectivo"],
    show: { title: "Detallado Interior Completo", pick: "Tamaño", book: "Reservar", added: "Cita añadida a tu calendario", addedSub: "Sáb · 9:00 am · Guaynabo", example: "Ejemplo", deposit: "Depósito para separar", via: "ATH Móvil o PayPal" },
    servicesK: "Servicios", servicesH: "Tres servicios, una misma calidad.", servicesP: "Escoge a dónde vas. Cada sección tiene sus precios, su forma de reservar o cotizar, y ejemplos reales.",
    tiles: {
      interiors: { badge: "Reservas en línea", title: "Redline Interiors", desc: "Detallado interior a domicilio para autos y muebles del hogar. Escoge el servicio, el día y la hora, y separa con depósito.", cta: "Ver precios y reservar" },
      tech: { badge: "Cotización gratis", title: "Redline Technologies", desc: "Consultoría, asistencia remota, PCs a la medida (o te guío para armarla) y páginas web.", cta: "Pedir cotización" },
      portfolio: { badge: "{n} proyectos", title: "Redline Portfolio", desc: "Antes y después, PCs armadas y proyectos web terminados.", cta: "Ver proyectos" },
    },
    from: "desde", popular: "Más pedidos",
    stats: [["desde", "Detallado de autos"], ["pueblos", "Área Metropolitana"], ["depósito", B.depositFrom ? `En trabajos de $${B.depositFrom}+` : "Se descuenta del total"], ["horas", "de aviso para reservar"]],
    stepsK: "Cómo funciona", stepsH: "Tu cita en cuatro pasos.",
    steps: ["Escoge tus servicios", "Escoge día y hora", "Envía tu solicitud (y el depósito si aplica)", "Te confirmo por WhatsApp"],
    faqK: "Preguntas", faqH: "Preguntas frecuentes",
    faq: ["¿Qué pueblos cubren?", "¿Cuánto cuesta?", "¿Cómo separo mi cita?", "¿Cómo pago?", "¿Puedo cancelar o mover la cita?", "¿Qué necesitas de mí?"],
    other: "Otro pueblo: escríbeme y lo coordinamos.",
    bandH: "¿Listo para que tu interior quede como nuevo?", bandP: "Mira los precios y escoge tu hora en menos de un minuto.",
    foot: { services: "Servicios", contact: "Contacto", about: "Detallado, tecnología y web en el Área Metropolitana de Puerto Rico." },
    closed: {
      nav: "Cotizar",
      pill: ["Muy pronto", "Redline Interiors: detallado a domicilio"],
      lead: "Consultoría, PCs a la medida y páginas web, con detallado interior a domicilio muy pronto. Todo bajo una misma marca, en el Área Metropolitana de Puerto Rico.",
      ctaA: "Pedir cotización", ctaB: "Ver proyectos",
      trust: ["Área Metropolitana", "Español e inglés", "Cotización gratis"],
      soon: "Muy pronto", soonShort: "Detallado interior a domicilio para autos y muebles. Estoy afinando los últimos detalles.", soonCta: "Ver más",
      example: "Ejemplo", quotePc: "Cotizar una PC", stress: "Prueba de estrés",
      sheet: [["Uso", "Gaming 1440p + stream"], ["CPU", "8 núcleos / 16 hilos"], ["GPU", "12 GB VRAM"], ["RAM", "32 GB DDR5"], ["SSD", "2 TB NVMe"]],
      freeK: "Cotización", freeH: "Gratis", freeP: "Precio claro antes de empezar",
      techDesc: "Consultoría, asistencia remota, PCs a la medida (o una guía para armar la tuya) y páginas web. Cada trabajo empieza con una cotización gratis.",
      techList: [["Consultoría y soporte remoto", "Compras, configuración y ayuda a distancia"], ["PCs a la medida", "Armadas por mí o guiándote a ti"], ["Desarrollo web", "Bilingües, con dominio y email"]],
      stepsK: "Cómo trabajo", stepsH: "De la idea a funcionando.",
      steps: ["Cuéntame qué necesitas", "Cotización clara", "Manos a la obra", "Entrega y soporte"],
      bandH: "¿Tienes un proyecto en mente?", bandP: "Cuéntame qué necesitas y te envío una cotización gratis.",
    },
  },
  en: {
    nav: { book: "Book" },
    pill: ["New", "Online booking with ATH Móvil deposit"],
    h1a: "Every job, taken to the", h1b: "redline.",
    lead: "Mobile interior detailing, tech solutions and websites. All under one brand, in the San Juan metro area, Puerto Rico.",
    ctaBook: "Book a detail", ctaQuote: "Get a quote",
    trust: ["San Juan metro area", "Spanish and English", "ATH Móvil · PayPal · Cash"],
    show: { title: "Full Interior Detail", pick: "Size", book: "Book", added: "Booking added to your calendar", addedSub: "Sat · 9:00 am · Guaynabo", example: "Example", deposit: "Deposit to book", via: "ATH Móvil or PayPal" },
    servicesK: "Services", servicesH: "Three services, one standard.", servicesP: "Pick where you're headed. Each section has its prices, its way to book or quote, and real examples.",
    tiles: {
      interiors: { badge: "Book online", title: "Redline Interiors", desc: "Mobile interior detailing for cars and home furniture. Pick the service, the day and the time, and hold it with a deposit.", cta: "See prices and book" },
      tech: { badge: "Free quote", title: "Redline Technologies", desc: "Consulting, remote support, custom PC builds (or I guide you through yours) and websites.", cta: "Get a quote" },
      portfolio: { badge: "{n} projects", title: "Redline Portfolio", desc: "Before and afters, finished PC builds and web projects.", cta: "See the work" },
    },
    from: "from", popular: "Most popular",
    stats: [["from", "Car detailing"], ["towns", "San Juan metro area"], ["deposit", B.depositFrom ? `On jobs of $${B.depositFrom}+` : "Comes off your total"], ["hours", "notice to book"]],
    stepsK: "How it works", stepsH: "Your visit in four steps.",
    steps: ["Pick your services", "Pick a day and time", "Send it (plus the deposit if needed)", "I confirm on WhatsApp"],
    faqK: "Questions", faqH: "Frequently asked questions",
    faq: ["Which towns do you cover?", "How much does it cost?", "How do I hold my booking?", "How do I pay?", "Can I cancel or move my booking?", "What do you need from me?"],
    other: "Another town: message me and we'll work it out.",
    bandH: "Ready for an interior that looks new again?", bandP: "See the prices and pick your time in under a minute.",
    foot: { services: "Services", contact: "Contact", about: "Detailing, tech and web in the San Juan metro area, Puerto Rico." },
    closed: {
      nav: "Get a quote",
      pill: ["Coming soon", "Redline Interiors: mobile detailing"],
      lead: "Consulting, custom PCs and websites, with mobile interior detailing coming soon. All under one brand, in the San Juan metro area, Puerto Rico.",
      ctaA: "Get a quote", ctaB: "See projects",
      trust: ["San Juan metro area", "Spanish and English", "Free quote"],
      soon: "Coming soon", soonShort: "Mobile interior detailing for cars and furniture. I'm fine-tuning the last details.", soonCta: "Learn more",
      example: "Example", quotePc: "Quote a PC", stress: "Stress test",
      sheet: [["Use", "1440p gaming + stream"], ["CPU", "8 cores / 16 threads"], ["GPU", "12 GB VRAM"], ["RAM", "32 GB DDR5"], ["SSD", "2 TB NVMe"]],
      freeK: "Quote", freeH: "Free", freeP: "A clear price before work starts",
      techDesc: "Consulting, remote support, custom PC builds (or a guide to build your own) and websites. Every job starts with a free quote.",
      techList: [["Consulting and remote support", "Buying, setup and help from a distance"], ["Custom PC builds", "Built by me, or with my guidance"], ["Web development", "Bilingual, with domain and email"]],
      stepsK: "How it works", stepsH: "From idea to up and running.",
      steps: ["Tell me what you need", "Clear quote", "The work", "Handover and support"],
      bandH: "Got a project in mind?", bandP: "Tell me what you need and I'll send you a free quote.",
    },
  },
};

const L = (v, lang) => (v && typeof v === "object" && !Array.isArray(v) ? v[lang] ?? v.es : v);
const fade = (i = 0) => ({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.55, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] } });

function usePersisted(key, initial) {
  const [v, setV] = useState(() => { try { return localStorage.getItem(key) || initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, v); } catch {} }, [key, v]);
  return [v, setV];
}

function Meter({ className = "" }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && window.redlineGauge) window.redlineGauge(ref.current, { value: 0.7, animate: true }); }, []);
  return (
    <div className={`relative aspect-square ${className}`}>
      <img src="/assets/img/ring.webp" alt="" className="absolute inset-0 size-full" />
      <svg ref={ref} viewBox="0 0 1120 1120" aria-hidden="true" className="absolute inset-0 size-full" />
    </div>
  );
}

function SectionHead({ k, h, p, center }) {
  return (
    <motion.div {...fade()} className={`mb-10 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="mb-2 text-sm font-semibold text-primary">{k}</p>
      <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{h}</h2>
      {p && <p className="mt-3 text-base-content/70">{p}</p>}
    </motion.div>
  );
}

export default function App() {
  const [lang, setLang] = usePersisted("lang", "es");
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = usePersisted("theme", prefersDark ? "redline-dark" : "redline-light");
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const t = T[lang];
  const open = B.open !== false;   // interiors/config.js "open": false = Interiors shows "coming soon"
  const c = t.closed;

  const data = useMemo(() => {
    const cat = (id) => B.categories.find((c) => c.id === id);
    const min = (list) => Math.min(...list.flatMap((s) => s.options.map((o) => o.price)));
    const car = cat("car"), home = cat("home");
    const full = car?.services.find((s) => s.id === "car-full");
    return {
      cur: B.currency || "$",
      carFrom: car ? min(car.services) : 90,
      homeFrom: home ? min(home.services) : 25,
      full,
      towns: B.municipalities || [],
      deposit: B.deposit || 100,
      notice: B.minNoticeHours || 24,
      projects: (window.PROJECTS || []).filter((p) => !p.draft).length,
      popular: B.categories.flatMap((c) => c.services.filter((s) => s.popular)),
      notes: L(B.notes, lang) || [],
    };
  }, [lang]);
  const [size, setSize] = useState(1);
  const money = (n) => data.cur + n;

  const faqAnswers = [
    `${data.towns.join(", ")}. ${t.other}`,
    data.notes[0],
    data.notes[2],
    data.notes[3],
    data.notes[4],
    data.notes[1],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-100 text-base-content">
      {/* glass navbar (HeroUI) */}
      <header className="sticky top-0 z-40 border-b border-base-content/10 bg-base-100/70 backdrop-blur-xl">
        <nav className="navbar mx-auto max-w-6xl gap-2 px-4">
          <div className="flex-1">
            <a href="/" aria-label="RedlineHQ" className="inline-flex rounded-xl bg-[#0b0c0f] px-2.5 py-1 ring-1 ring-white/10"><img src="/assets/img/lockup-sm.webp" alt="RedlineHQ" className="h-9 w-auto" /></a>
          </div>
          <ul className="menu menu-horizontal hidden gap-1 px-1 text-sm font-medium md:flex">
            <li><a href="/interiors/">Interiors</a></li>
            <li><a href="/tech/">Technologies</a></li>
            <li><a href="/portfolio/">Portfolio</a></li>
            <li><a href="/garage/">Garage</a></li>
          </ul>
          <div className="join">
            {["es", "en"].map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`btn join-item btn-sm uppercase ${lang === l ? "btn-neutral" : "btn-ghost"}`}>{l}</button>
            ))}
          </div>
          <label className="btn btn-ghost btn-sm btn-circle swap swap-rotate" aria-label="Tema / Theme">
            <input type="checkbox" checked={theme === "redline-dark"} onChange={(e) => setTheme(e.target.checked ? "redline-dark" : "redline-light")} />
            <Sun className="swap-off size-5" />
            <Moon className="swap-on size-5" />
          </label>
          {open
            ? <a href="/interiors/#book" className="btn btn-primary btn-sm hidden sm:inline-flex">{t.nav.book}</a>
            : <a href="/tech/#quote" className="btn btn-primary btn-sm hidden sm:inline-flex">{c.nav}</a>}
        </nav>
        <ul className="menu menu-horizontal menu-sm w-full flex-nowrap justify-center gap-0 border-t border-base-content/5 py-1 text-[13px] md:hidden">
          <li><a href="/interiors/">Interiors</a></li>
          <li><a href="/tech/">Technologies</a></li>
          <li><a href="/portfolio/">Portfolio</a></li>
            <li><a href="/garage/">Garage</a></li>
        </ul>
      </header>

      <main>
        {/* hero (Preline layout + HeroUI glow) */}
        <section className="relative isolate">
          <div className="dot-grid pointer-events-none absolute inset-0 -z-10" />
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/30 via-accent/20 to-transparent blur-3xl" />
          <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 text-center sm:pt-20">
            <motion.a {...fade(0)} href="/interiors/" className="mx-auto inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 py-1 pr-3 pl-1 text-sm shadow-sm backdrop-blur">
              <span className="badge badge-primary badge-sm rounded-full">{(open ? t.pill : c.pill)[0]}</span>
              <span className="text-base-content/80">{(open ? t.pill : c.pill)[1]}</span>
              <ChevronRight className="size-4 text-base-content/50" />
            </motion.a>
            <motion.h1 {...fade(1)} className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              {t.h1a} <span className="text-gradient">{t.h1b}</span>
            </motion.h1>
            <motion.p {...fade(2)} className="mx-auto mt-5 max-w-2xl text-lg text-base-content/70">{open ? t.lead : c.lead}</motion.p>
            <motion.div {...fade(3)} className="mt-8 flex flex-wrap justify-center gap-3">
              {open ? (<>
                <a href="/interiors/#book" className="btn btn-primary btn-lg rounded-xl shadow-lg shadow-primary/25">{t.ctaBook}<ArrowRight className="size-5" /></a>
                <a href="/tech/#quote" className="btn btn-outline btn-lg rounded-xl">{t.ctaQuote}</a>
              </>) : (<>
                <a href="/tech/#quote" className="btn btn-primary btn-lg rounded-xl shadow-lg shadow-primary/25">{c.ctaA}<ArrowRight className="size-5" /></a>
                <a href="/portfolio/" className="btn btn-outline btn-lg rounded-xl">{c.ctaB}</a>
              </>)}
            </motion.div>
            <motion.ul {...fade(4)} className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-base-content/60">
              {(open ? t.trust : c.trust).map((x, i) => <li key={x} className="flex items-center gap-1.5">{[<MapPin key="a" className="size-4" />, <MessageCircle key="b" className="size-4" />, <ShieldCheck key="c" className="size-4" />][i]}{x}</li>)}
            </motion.ul>
          </div>

          {/* product showcase: real prices from the booking system (HeroUI-style floating cards) */}
          {open && <div className="mx-auto max-w-5xl px-4 pb-16">
            <motion.div {...fade(2)} className="relative grid items-center gap-5 md:grid-cols-[1fr_1.15fr_1fr]">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="card order-2 border border-base-content/10 bg-base-100 shadow-xl md:order-1 md:-rotate-2">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-success"><CalendarCheck className="size-4" />{t.show.added}</div>
                  <p className="text-sm text-base-content/70">{t.show.addedSub}</p>
                  <span className="badge badge-ghost badge-sm self-start">{t.show.example}</span>
                </div>
              </motion.div>

              <div className="card order-1 border border-base-content/10 bg-base-100 shadow-2xl shadow-primary/10 md:order-2">
                <div className="card-body gap-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="card-title text-lg">{data.full ? L(data.full.name, lang) : t.show.title}</h3>
                    <span className="badge badge-primary badge-soft">Interiors</span>
                  </div>
                  <p className="text-left text-sm text-base-content/70">{data.full ? L(data.full.desc, lang) : ""}</p>
                  <div className="text-left text-xs font-semibold tracking-wide text-base-content/60 uppercase">{t.show.pick}</div>
                  <div className="grid gap-2">
                    {(data.full?.options || []).map((o, i) => (
                      <button key={i} onClick={() => setSize(i)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${size === i ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-base-content/10 hover:border-base-content/30"}`}>
                        <span className="font-medium">{L(o.label, lang)}</span>
                        <span className="font-bold tabular-nums">{money(o.price)}</span>
                      </button>
                    ))}
                  </div>
                  <a href="/interiors/#book" className="btn btn-primary rounded-xl">{t.show.book}<ArrowRight className="size-4" /></a>
                </div>
              </div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="order-3 grid gap-4 md:rotate-2">
                <div className="card border border-base-content/10 bg-neutral text-neutral-content shadow-xl">
                  <div className="card-body items-center p-5"><Meter className="w-40" /></div>
                </div>
                <div className="card border border-base-content/10 bg-base-100 shadow-xl">
                  <div className="card-body p-5 text-left">
                    <div className="text-xs font-semibold text-base-content/60 uppercase">{t.show.deposit}</div>
                    <div className="text-3xl font-extrabold tabular-nums">{money(data.deposit)}</div>
                    <div className="text-sm text-base-content/60">{t.show.via}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>}

          {/* showcase while Interiors is closed: the tech side */}
          {!open && <div className="mx-auto max-w-5xl px-4 pb-16">
            <motion.div {...fade(2)} className="relative grid items-center gap-5 md:grid-cols-[1fr_1.15fr_1fr]">
              <motion.a href="/interiors/" animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="card order-2 border border-base-content/10 bg-base-100 shadow-xl md:order-1 md:-rotate-2">
                <div className="card-body gap-3 p-5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Armchair className="size-5" /></span>
                    <span className="badge badge-warning badge-soft badge-sm">{c.soon}</span>
                  </div>
                  <div className="font-bold">Redline Interiors</div>
                  <p className="text-sm text-base-content/70">{c.soonShort}</p>
                </div>
              </motion.a>

              <div className="card order-1 border border-base-content/10 bg-base-100 shadow-2xl shadow-primary/10 md:order-2">
                <div className="card-body gap-0 p-0 text-left">
                  <div className="flex items-center justify-between border-b border-base-content/10 px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                    <span className="text-base-content/60">Build sheet</span><span className="badge badge-ghost badge-sm">{c.example}</span>
                  </div>
                  <dl className="px-6 py-2 text-sm tabular-nums">
                    {c.sheet.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-dashed border-base-content/10 py-2 last:border-0"><dt className="text-base-content/55">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                    ))}
                  </dl>
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-base-content/10 px-6 py-4 text-xs">
                    <span className="text-base-content/60">{c.stress}</span><progress className="progress progress-success w-full" value="100" max="100" /><b>2 h</b>
                  </div>
                  <div className="px-6 pb-6"><a href="/tech/#quote" className="btn btn-primary w-full rounded-xl">{c.quotePc}<ArrowRight className="size-4" /></a></div>
                </div>
              </div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="order-3 grid gap-4 md:rotate-2">
                <div className="card border border-base-content/10 bg-neutral text-neutral-content shadow-xl">
                  <div className="card-body items-center p-5"><Meter className="w-40" /></div>
                </div>
                <div className="card border border-base-content/10 bg-base-100 shadow-xl">
                  <div className="card-body p-5 text-left">
                    <div className="text-xs font-semibold text-base-content/60 uppercase">{c.freeK}</div>
                    <div className="flex items-center gap-2 text-3xl font-extrabold"><BadgeCheck className="size-7 text-success" />{c.freeH}</div>
                    <div className="text-sm text-base-content/60">{c.freeP}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>}
        </section>

        {/* services bento (Preline) */}
        <section id="services" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:py-24">
          <SectionHead k={t.servicesK} h={t.servicesH} p={t.servicesP} />
          {open && <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
            <motion.a {...fade(0)} href="/interiors/" className="group card relative overflow-hidden border border-base-content/10 bg-gradient-to-br from-primary/10 via-base-100 to-base-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15 lg:col-span-2 lg:row-span-2">
              <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-primary/20 blur-3xl" />
              <div className="card-body gap-5 p-7 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Armchair className="size-6" /></span>
                  <span className="badge badge-success badge-soft gap-1.5"><span className="status status-success" />{t.tiles.interiors.badge}</span>
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight">{t.tiles.interiors.title}</h3>
                <p className="max-w-lg text-base-content/70">{t.tiles.interiors.desc}</p>
                <div className="max-w-lg">
                  <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase">{t.popular}</div>
                  <ul className="divide-y divide-base-content/10 rounded-2xl border border-base-content/10 bg-base-100/80 backdrop-blur">
                    {data.popular.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                        <span className="flex items-center gap-2 font-medium"><Sparkles className="size-4 text-primary" />{L(s.name, lang)}</span>
                        <span className="shrink-0 text-sm text-base-content/60">{t.from} <b className="text-base font-bold text-base-content tabular-nums">{money(Math.min(...s.options.map((o) => o.price)))}</b></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid max-w-lg gap-3 sm:grid-cols-2">
                  {B.categories.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-base-content/10 bg-base-100/80 p-4 backdrop-blur">
                      <div className="text-sm text-base-content/60">{L(c.title, lang)}</div>
                      <div className="text-2xl font-extrabold tabular-nums"><span className="text-sm font-medium text-base-content/50">{t.from} </span>{money(Math.min(...c.services.flatMap((s) => s.options.map((o) => o.price))))}</div>
                    </div>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-2 font-semibold text-primary">{t.tiles.interiors.cta}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </div>
            </motion.a>

            {[["tech", "/tech/", Cpu, "badge-primary"], ["portfolio", "/portfolio/", Images, "badge-ghost"]].map(([k, href, Icon, badge], i) => (
              <motion.a key={k} {...fade(i + 1)} href={href} className="group card border border-base-content/10 bg-base-100 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <div className="card-body gap-3 p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-base-200 text-primary"><Icon className="size-5" /></span>
                    <span className={`badge badge-soft ${badge}`}>{t.tiles[k].badge.replace("{n}", data.projects)}</span>
                  </div>
                  <h3 className="text-xl font-bold">{t.tiles[k].title}</h3>
                  <p className="text-sm text-base-content/70">{t.tiles[k].desc}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-primary">{t.tiles[k].cta}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
                </div>
              </motion.a>
            ))}
          </div>}

          {!open && <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
            <motion.a {...fade(0)} href="/tech/" className="group card relative overflow-hidden border border-base-content/10 bg-gradient-to-br from-primary/10 via-base-100 to-base-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15 lg:col-span-2 lg:row-span-2">
              <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-primary/20 blur-3xl" />
              <div className="card-body gap-5 p-7 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Cpu className="size-6" /></span>
                  <span className="badge badge-primary badge-soft">{t.tiles.tech.badge}</span>
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight">{t.tiles.tech.title}</h3>
                <p className="max-w-lg text-base-content/70">{c.techDesc}</p>
                <ul className="max-w-lg divide-y divide-base-content/10 rounded-2xl border border-base-content/10 bg-base-100/80 backdrop-blur">
                  {c.techList.map(([name, sub], i) => {
                    const Icon = [Wrench, Monitor, Code][i];
                    return (
                      <li key={name} className="flex items-center gap-3 px-4 py-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-200 text-primary"><Icon className="size-4" /></span>
                        <span><span className="block font-medium">{name}</span><span className="block text-sm text-base-content/60">{sub}</span></span>
                      </li>
                    );
                  })}
                </ul>
                <span className="mt-auto inline-flex items-center gap-2 font-semibold text-primary">{t.tiles.tech.cta}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </div>
            </motion.a>

            <motion.a {...fade(1)} href="/portfolio/" className="group card border border-base-content/10 bg-base-100 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
              <div className="card-body gap-3 p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-base-200 text-primary"><Images className="size-5" /></span>
                  <span className="badge badge-ghost badge-soft">{t.tiles.portfolio.badge.replace("{n}", data.projects)}</span>
                </div>
                <h3 className="text-xl font-bold">{t.tiles.portfolio.title}</h3>
                <p className="text-sm text-base-content/70">{t.tiles.portfolio.desc}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-primary">{t.tiles.portfolio.cta}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </div>
            </motion.a>

            <motion.a {...fade(2)} href="/interiors/" className="group card border border-dashed border-base-content/20 bg-base-100 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
              <div className="card-body gap-3 p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-base-200 text-primary"><Armchair className="size-5" /></span>
                  <span className="badge badge-warning badge-soft">{c.soon}</span>
                </div>
                <h3 className="text-xl font-bold">{t.tiles.interiors.title}</h3>
                <p className="text-sm text-base-content/70">{c.soonShort}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-primary">{c.soonCta}<ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </div>
            </motion.a>
          </div>}
        </section>

        {/* stats (daisyUI) */}
        {open && <section className="border-y border-base-content/10 bg-base-200/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 py-10 md:grid-cols-4">
            {[[money(data.carFrom), 0], [data.towns.length, 1], [money(data.deposit), 2], [data.notice, 3]].map(([v, i]) => (
              <motion.div key={i} {...fade(i)} className="px-4 py-3 text-center">
                <div className="text-4xl font-extrabold tracking-tight tabular-nums">{v}<span className="ml-1 text-base font-semibold text-base-content/50">{i === 1 ? t.stats[1][0] : i === 3 ? t.stats[3][0] : ""}</span></div>
                <div className="mt-1 text-sm text-base-content/60">{i === 0 ? `${t.stats[0][0]} · ${t.stats[0][1]}` : i === 2 ? `${t.stats[2][0]} · ${t.stats[2][1]}` : t.stats[i][1]}</div>
              </motion.div>
            ))}
          </div>
        </section>}

        {/* steps (daisyUI) */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <SectionHead k={open ? t.stepsK : c.stepsK} h={open ? t.stepsH : c.stepsH} center />
          <motion.ul {...fade(1)} className="steps steps-vertical w-full sm:steps-horizontal">
            {(open ? t.steps : c.steps).map((s, i) => <li key={s} className={`step ${i < 3 ? "step-primary" : "step-primary"} text-sm font-medium`}>{s}</li>)}
          </motion.ul>
        </section>

        {/* FAQ (Preline layout, daisyUI collapse) */}
        {open && <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 sm:pb-24 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead k={t.faqK} h={t.faqH} />
          <motion.div {...fade(1)} className="join join-vertical w-full">
            {t.faq.map((q, i) => (
              <div key={q} className="collapse collapse-arrow join-item border border-base-content/10 bg-base-100">
                <input type="radio" name="faq" defaultChecked={i === 0} aria-label={q} />
                <div className="collapse-title font-semibold">{q}</div>
                <div className="collapse-content text-sm text-base-content/70">{faqAnswers[i]}</div>
              </div>
            ))}
          </motion.div>
        </section>}

        {/* CTA band */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <motion.div {...fade()} className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-accent px-6 py-14 text-center text-primary-content shadow-2xl shadow-primary/25 sm:px-12">
            <div className="pointer-events-none absolute -top-24 -left-24 -z-10 size-72 rounded-full bg-white/20 blur-3xl" />
            <Sparkles className="mx-auto mb-4 size-8 opacity-90" />
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{open ? t.bandH : c.bandH}</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{open ? t.bandP : c.bandP}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={open ? "/interiors/#book" : "/tech/#quote"} className="btn btn-lg rounded-xl border-0 bg-white text-primary hover:bg-white/90">{open ? t.ctaBook : c.ctaA}<ArrowRight className="size-5" /></a>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" className="btn btn-lg btn-outline rounded-xl border-white/70 text-white hover:bg-white/10"><MessageCircle className="size-5" />WhatsApp</a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* footer (Preline columns) */}
      <footer className="border-t border-base-content/10 bg-base-200/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="inline-flex rounded-xl bg-[#0b0c0f] px-3 py-1.5 ring-1 ring-white/10"><img src="/assets/img/lockup-sm.webp" alt="RedlineHQ" className="h-10 w-auto" /></span>
            <p className="mt-4 max-w-xs text-sm text-base-content/60">{t.foot.about}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">{t.foot.services}</h4>
            <ul className="grid gap-2 text-sm text-base-content/70">
              <li><a className="link link-hover" href="/interiors/">Redline Interiors</a></li>
              <li><a className="link link-hover" href="/tech/">Redline Technologies</a></li>
              <li><a className="link link-hover" href="/portfolio/">Redline Portfolio</a></li>
              <li><a className="link link-hover" href="/garage/">Redline Garage</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">{t.foot.contact}</h4>
            <ul className="grid gap-2 text-sm text-base-content/70">
              <li className="flex items-center gap-2"><Phone className="size-4" />{SITE.phone}</li>
              <li className="flex items-center gap-2"><Mail className="size-4" />{SITE.email}</li>
              <li><a className="link link-hover flex items-center gap-2" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener"><MessageCircle className="size-4" />WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-base-content/10 py-5 text-center text-xs text-base-content/50">© {new Date().getFullYear()} RedlineHQ · redlinehq.work</div>
      </footer>
    </div>
  );
}
