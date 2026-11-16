# RedlineHQ — redlinehq.work

The RedlineHQ website: a hub page with three sections, all bilingual (Spanish by default, English toggle) and sharing one dark black / Cyber Grey / red design.

| Page | Folder | What it is |
|---|---|---|
| **Hub** | `index.html` | Logo with animated tachometer, three service buttons, contact |
| **Redline Interiors** | `interiors/` | Prices and online booking with calendar, deposit, WhatsApp/email requests |
| **Redline Technologies** | `tech/` | Consulting, custom PC builds, web development, free-quote form |
| **Redline Portfolio** | `portfolio/` | Finished work with filters and before/after photo sliders |

## Where to change things

| To change… | Edit |
|---|---|
| Phone, WhatsApp, email used across the site | `assets/site.js` (top of the file) |
| Detailing prices, hours, days off, deposit, About text | `interiors/config.js` |
| Portfolio projects and photos | `portfolio/projects.js` (+ photos in `portfolio/img/`) |
| Colours, fonts, buttons (whole site) | `assets/redline.css` |
| Technologies services text | `tech/index.html` |
| Logo files | `assets/img/`: `lockup.webp` = full logo (RPM meter + name), `badge.webp` = meter only, `wordmark.webp` = R3DL1NE name, `ring.webp` = empty ring the live meter is drawn on (`assets/gauge.js`) |

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
