import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Armchair, Cpu, Images, MessageCircle, Copy, Check, MapPin } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

const SITE = { whatsapp: "17879100777", phone: "(787) 910-0777", email: "citas@redlinehq.work" };

const T = {
  es: {
    kicker: "RedlineHQ · Área Metropolitana, Puerto Rico",
    h1a: "Cada trabajo, hasta la ", h1b: "línea roja.",
    lead: "Tres servicios bajo una misma marca: detallado interior a domicilio, soluciones de tecnología y un portafolio con el trabajo terminado.",
    book: "Reservar detallado", see: "Ver servicios", taking: "Aceptando citas",
    servicesK: "Servicios", servicesH: "Escoge a dónde vas.",
    contactK: "Contacto", contactH: "¿Tienes algo en mente?",
    contactP: "Escribe por WhatsApp o email con lo que necesitas: una cita de detallado, una PC nueva o una página web.",
    phone: "Teléfono / WhatsApp", copy: "Copiar", copied: "Copiado",
    tiles: [
      { badge: "Reservas en línea", desc: "Detallado interior a domicilio para autos y muebles del hogar.", specs: ["Autos desde {car}", "Sofás, colchones, alfombras y sillas", "Depósito por ATH Móvil o PayPal"], cta: "Reservar cita" },
      { badge: "Cotización gratis", desc: "Consultoría, PCs a la medida y desarrollo de páginas web.", specs: ["Consultoría para casa y negocio", "PCs gaming y de trabajo, armadas y probadas", "Páginas web con dominio y email"], cta: "Pedir cotización" },
      { badge: "{n} proyectos", desc: "Prueba del trabajo: antes y después, builds y proyectos web.", specs: ["Fotos de antes y después", "PCs armadas", "Páginas y sistemas web"], cta: "Ver proyectos" },
    ],
  },
  en: {
    kicker: "RedlineHQ · San Juan Metro Area, Puerto Rico",
    h1a: "Every job, taken to the ", h1b: "redline.",
    lead: "Three services under one brand: mobile interior detailing, tech solutions, and a portfolio of finished work.",
    book: "Book a detail", see: "See services", taking: "Taking bookings",
    servicesK: "Services", servicesH: "Pick where you're headed.",
    contactK: "Contact", contactH: "Got something in mind?",
    contactP: "Send a WhatsApp or email with what you need: a detailing visit, a new PC or a website.",
    phone: "Phone / WhatsApp", copy: "Copy", copied: "Copied",
    tiles: [
      { badge: "Book online", desc: "Mobile interior detailing for cars and home furniture.", specs: ["Cars from {car}", "Sofas, mattresses, rugs and chairs", "Deposit by ATH Móvil or PayPal"], cta: "Book a visit" },
      { badge: "Free quote", desc: "Consulting, custom PC builds and website development.", specs: ["Tech consulting for home and business", "Gaming and work PCs, built and tested", "Websites with domain and email"], cta: "Get a quote" },
      { badge: "{n} projects", desc: "Proof of work: before and afters, builds and web projects.", specs: ["Before and after photos", "Finished PC builds", "Websites and web systems"], cta: "See the work" },
    ],
  },
};

const TILES = [
  { name: "Interiors", href: "/interiors/", icon: Armchair, live: true },
  { name: "Technologies", href: "/tech/", icon: Cpu, red: true },
  { name: "Portfolio", href: "/portfolio/", icon: Images },
];

const fadeUp = (i = 0) => ({ initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" }, transition: { duration: 0.5, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] } });

function useLang() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("lang") || "es"; } catch { return "es"; } });
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem("lang", lang); } catch {} }, [lang]);
  return [lang, setLang];
}

function Meter() {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && window.redlineGauge) window.redlineGauge(ref.current, { value: 0.7, animate: true }); }, []);
  return (
    <div className="relative aspect-square">
      <img src="/assets/img/ring.webp" alt="" className="absolute inset-0 size-full drop-shadow-[10px_0_18px_rgba(0,0,0,0.65)]" />
      <svg ref={ref} viewBox="0 0 1120 1120" aria-hidden="true" className="absolute inset-0 size-full" />
    </div>
  );
}

function CopyRow({ label, value, t }) {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1600); } catch {} };
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg-2 px-4 py-3.5">
      <div className="min-w-0">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
        <div className="mt-1 truncate font-semibold">{value}</div>
      </div>
      <Button variant="outline" size="sm" onClick={copy} aria-label={t.copy}>{done ? <Check /> : <Copy />}{done ? t.copied : t.copy}</Button>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const facts = useMemo(() => {
    let car = "$90", n = 3;
    try { const c = window.BUSINESS.categories.find((x) => x.id === "car"); car = window.BUSINESS.currency + Math.min(...c.services.flatMap((s) => s.options.map((o) => o.price))); } catch {}
    try { n = window.PROJECTS.length; } catch {}
    return { car, n };
  }, []);
  const fill = (s) => s.replace("{car}", facts.car).replace("{n}", facts.n);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]" />

      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-3 px-4 py-2">
          <a href="/" aria-label="RedlineHQ"><img src="/assets/img/lockup-sm.webp" alt="RedlineHQ" className="h-11 w-auto drop-shadow-[0_0_12px_rgba(227,22,29,0.3)]" /></a>
          <Badge className="hidden sm:inline-flex">v2 · React</Badge>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:ml-auto sm:w-auto">
            {TILES.map((x) => <Button key={x.name} variant="ghost" size="sm" href={x.href}>{x.name}</Button>)}
          </nav>
          <div className="ml-auto flex rounded-full border border-line-2 bg-bg-2 p-1 sm:ml-0" role="group" aria-label="Language">
            {["es", "en"].map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`rounded-full px-3 py-1.5 font-mono text-xs font-bold uppercase ${lang === l ? "bg-ink text-bg" : "text-muted"}`}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-16">
          <motion.p {...fadeUp(0)} className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-red-hot before:mr-2.5 before:inline-block before:h-0.5 before:w-5 before:bg-red before:align-middle">{t.kicker}</motion.p>
          <motion.div {...fadeUp(1)} className="relative mb-10 aspect-[1725/590] w-full max-w-[1000px]" role="img" aria-label="R3DL1NE">
            <img src="/assets/img/wordmark-lg.webp" alt="" className="absolute top-0 left-[18.84%] w-[81.16%] drop-shadow-[0_18px_40px_rgba(227,22,29,0.3)]" />
            <div className="absolute top-[20.34%] left-0 z-10 w-[27.25%]"><Meter /></div>
          </motion.div>
          <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <motion.div {...fadeUp(2)}>
              <h1 className="font-display text-4xl leading-[1.04] font-bold italic tracking-tight text-balance sm:text-5xl lg:text-[56px]">
                {t.h1a}<span className="text-red-hot [text-shadow:0_0_34px_rgba(255,40,48,0.45)]">{t.h1b}</span>
              </h1>
              <p className="mt-4 max-w-[60ch] text-lg text-[#c5cbd1]">{t.lead}</p>
            </motion.div>
            <motion.div {...fadeUp(3)} className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-3">
                <Button href="/interiors/#book">{t.book}<ArrowRight /></Button>
                <Button variant="outline" href="#services">{t.see}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge><span className="size-1.5 rounded-full bg-ok shadow-[0_0_8px_var(--color-ok)]" />{t.taking}</Badge>
                <Badge><MapPin className="size-3" />18.47°N 66.11°W</Badge>
                <Badge>ES / EN</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="relative h-2 tach" aria-hidden="true"><div className="tach-hot absolute inset-y-0 right-0 w-[22%]" /></div>

        {/* services */}
        <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-24">
          <motion.div {...fadeUp(0)} className="mb-8">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-red-hot">{t.servicesK}</p>
            <h2 className="font-display text-3xl font-bold sm:text-[44px]">{t.servicesH}</h2>
          </motion.div>
          <div className="grid gap-5 lg:grid-cols-3">
            {TILES.map((tile, i) => {
              const c = t.tiles[i], Icon = tile.icon;
              return (
                <motion.a key={tile.name} href={tile.href} {...fadeUp(i)} whileHover={{ y: -6 }}
                  className="group relative block rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-hot">
                  <Card className="relative flex h-full flex-col overflow-hidden transition-colors group-hover:border-red-hot/50">
                    <div className="pointer-events-none absolute -bottom-1/2 left-1/2 h-3/4 w-[140%] -translate-x-1/2 rounded-full bg-red/25 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
                    <CardHeader>
                      <span className="grid size-13 place-items-center rounded-2xl border border-line-2 bg-bg-2 text-red-hot"><Icon className="size-7" strokeWidth={1.8} /></span>
                      <Badge variant={tile.red ? "red" : "default"}>{tile.live && <span className="size-1.5 rounded-full bg-ok shadow-[0_0_8px_var(--color-ok)]" />}{fill(c.badge)}</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <h3 className="font-display text-[26px] leading-tight font-bold italic">
                        <span className="block font-mono text-xs not-italic tracking-[0.14em] text-muted uppercase">Redline</span>{tile.name}
                      </h3>
                      <p className="text-[#c3c9cf]">{c.desc}</p>
                      <ul className="mt-1 grid gap-2 border-t border-line pt-4 font-mono text-[13.5px] text-muted">
                        {c.specs.map((s) => <li key={s} className="flex gap-2.5 before:mt-[9px] before:h-0.5 before:w-2 before:shrink-0 before:bg-red">{fill(s)}</li>)}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <span className="font-semibold">{c.cta}</span>
                      <span className="grid size-10 place-items-center rounded-full bg-red text-white shadow-[0_8px_22px_-8px_rgba(255,40,48,0.6)] transition-transform group-hover:translate-x-1"><ArrowRight className="size-4" /></span>
                    </CardFooter>
                    <div className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-[0.18] bg-gradient-to-r from-cyber from-70% to-red-hot to-70% transition-transform duration-500 group-hover:scale-x-100" />
                  </Card>
                </motion.a>
              );
            })}
          </div>
        </section>

        {/* contact */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <motion.div {...fadeUp(0)}>
            <Card className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
              <div>
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-red-hot">{t.contactK}</p>
                <h2 className="font-display text-3xl font-bold italic sm:text-[44px]">{t.contactH}</h2>
                <p className="mt-3 max-w-[46ch] text-muted">{t.contactP}</p>
              </div>
              <div className="grid gap-3">
                <Button href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" className="w-full"><MessageCircle />WhatsApp</Button>
                <CopyRow label={t.phone} value={SITE.phone} t={t} />
                <CopyRow label="Email" value={SITE.email} t={t} />
              </div>
            </Card>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-line py-9 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-4">
          <img src="/assets/img/lockup-sm.webp" alt="RedlineHQ" className="h-10 w-auto" />
          <nav className="flex flex-wrap gap-5">{TILES.map((x) => <a key={x.name} href={x.href} className="text-ink hover:text-red-hot">Redline {x.name}</a>)}</nav>
          <span>© {new Date().getFullYear()} RedlineHQ · redlinehq.work</span>
        </div>
      </footer>
    </div>
  );
}
