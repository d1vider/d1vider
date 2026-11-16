# Interior Detailing — Prices & Booking Page

A one-page website where clients can see your prices, pick a free day and time, and send you a booking request on WhatsApp or by email.

## Make it yours (edit `config.js` only)

| What | Setting |
|---|---|
| Business name, tagline, area | `name`, `tagline`, `area` |
| Where requests go | `whatsapp` (digits with country code, no `+`), `email`, `phoneDisplay` |
| Days you work | `workingDays` (0 = Sun … 6 = Sat) |
| Working hours | `dayStart`, `dayEnd` |
| Travel time between jobs | `bufferMinutes` |
| Holidays / days off | `daysOff` |
| Jobs you've confirmed | `booked` (add one line per job so nobody else can book that time) |
| Services, sizes, prices, job length | `categories` → `services` → `options` |
| Extras | `addOns` |

The prices in the file are **examples**. Replace them with your own rates.

## How booking works

1. The client adds services, and the page adds up the price and how long the job will take.
2. The calendar only shows start times where the **whole job fits** in your working day, without overlapping a job you've already booked.
3. The client taps **Send request** and WhatsApp (or email) opens with the full booking already written out.
4. You reply to confirm, then add the job to `booked` in `config.js` and re-upload.

## Put it online for free (GitHub Pages)

Copy the four files (`index.html`, `styles.css`, `app.js`, `config.js`) into a new public repository, then go to **Settings → Pages**, pick the `main` branch, and save. Your link will be `https://<your-username>.github.io/<repo-name>/`.

Netlify works too: drag this folder onto https://app.netlify.com/drop.

To preview it on your own computer, just open `index.html` in a browser.
