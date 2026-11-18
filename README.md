# RedlineHQ — redlinehq.work

The RedlineHQ website: a hub page with three sections, all bilingual (Spanish by default, English toggle), in one Redline design with light and dark mode (follows the visitor's device, with a ☀️/🌙 switch).

Built with **Tailwind CSS 4 + daisyUI 5** (Redline light/dark themes). The hub is a small React app; the other pages are plain HTML + JavaScript. Source for the hub and the shared stylesheet lives in `../hub-src/`.

| Page | Folder | What it is |
|---|---|---|
| **Hub** | `index.html` + `app/` | Built from `../hub-src/` (don't edit these two by hand) |
| **Redline Interiors** | `interiors/` | Prices and online booking with calendar, deposit, WhatsApp/email requests |
| **Redline Technologies** | `tech/` | Consulting, custom PC builds, web development, free-quote form |
| **Redline Portfolio** | `portfolio/` | Finished work with filters and before/after photo sliders |

## Where to change things

| To change… | Edit |
|---|---|
| Phone, WhatsApp, email used across the site | `assets/site.js` (top of the file) |
| Detailing prices, hours, days off, deposit, About text | `interiors/config.js` |
| Portfolio projects and photos | `portfolio/projects.js` (+ photos in `portfolio/img/`) |
| Colours (light + dark themes) | `../hub-src/src/theme.css`, then rebuild (below) |
| Hub text and layout | `../hub-src/src/App.jsx`, then rebuild |
| Interiors / Technologies / Portfolio layout | their `index.html` (Tailwind + daisyUI classes), then rebuild the stylesheet |
| Technologies services text | `tech/index.html` |
| Logo files | `assets/img/`: `lockup.webp` = full logo (RPM meter joined to the name), `badge.webp` = meter only, `wordmark.webp` / `wordmark-lg.webp` = R3DL1NE name, `ring.webp` = empty ring the live meter is drawn on (`assets/gauge.js`) |

### Opening or closing Redline Interiors
In `interiors/config.js`, set `open: false` or `open: true`. No rebuild needed.

- **`open: false`** (now): `/interiors/` shows a "Muy pronto" (coming soon) page with a WhatsApp "Avísame cuando abra" button. The hub, navbar and portfolio point people to Technologies and Portfolio instead of booking.
- **Testing while closed:** the full booking page still works for you at **redlinehq.work/interiors/?preview** (with a "private preview" banner). It's real: a booking sent from there goes to your calendar.
- **`open: true`:** everything switches back to online booking.

### Admin page (only you)
The booking script also serves a private admin page: upcoming bookings (mark the deposit received, cancel, WhatsApp the client), quote requests with a status (Nuevo / Contestado / Cerrado), and days off. Every quote and booking is also saved to a Google Sheet, "Redline – Solicitudes", in your Google Drive.

One-time setup in script.google.com → Redline booking:
1. **Deploy → New deployment →** gear → **Web app**. **Execute as: Me**, **Who has access: Only myself** → **Deploy**.
2. Copy that web app URL, add `?action=admin` to the end, and bookmark it (Safari on iPhone: Share → Add to Home Screen).

Google asks you to sign in with your account, and anyone else gets "No autorizado". The public deployment the website uses stays as it is.

### Rebuilding after a design change
From the `hub-src` folder:
- `npm run build`: rebuilds the hub (`index.html` + `app/`)
- `npm run build:pages`: rebuilds `assets/redline-ui.css` for the other pages (run it after adding new Tailwind classes to their HTML)
- `npm run build:all`: both

Price, text, project and contact changes in `config.js`, `projects.js` and `site.js` need **no** rebuild.

### Adding a detailing before/after to the portfolio
1. Put two photos in `portfolio/img/`, e.g. `civic-before.jpg` and `civic-after.jpg` (same size, landscape works best).
2. In `portfolio/projects.js`, copy a project block and set `category: "interiors"`, plus `before: "img/civic-before.jpg"` and `after: "img/civic-after.jpg"`.
3. The "coming soon" card disappears automatically once the first detailing project is in.

## Putting it on redlinehq.work (later)

This folder is built to be the **root** of the website. When you're ready:

1. Put the contents of this `redlinehq/` folder at the top level of its own GitHub repo (for example `d1vider/redlinehq`). The `CNAME` file already says `redlinehq.work`.
2. In that repo: **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**, then type `redlinehq.work` under **Custom domain**.
3. In **Porkbun → redlinehq.work → DNS**:
   - Delete the **ALIAS** record and the `*` **CNAME** that point to `pixie.porkbun.com`.
   - Add four **A** records with Host blank: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Add a **CNAME** with Host `www` pointing to `d1vider.github.io`.
   - **Leave the MX, TXT and `sig1._domainkey` records alone.** Those are your iCloud email.
4. After GitHub shows the domain as verified (minutes to a few hours), tick **Enforce HTTPS**.

The pages will then live at `redlinehq.work`, `redlinehq.work/interiors/`, `redlinehq.work/tech/` and `redlinehq.work/portfolio/`.
