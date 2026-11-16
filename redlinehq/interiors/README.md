# Redline Interiors — Prices & Booking Page

One-page site (Spanish + English) where clients see your prices, pick a free day and time in the San Juan metro area, and request a booking with a $100 deposit (ATH Móvil or PayPal; balance also in cash).

## Files

| File | What it is |
|---|---|
| `config.js` | **Your settings.** Name, logo, prices, hours, towns, deposit, payments, About text, photos. The only file you normally edit. |
| `index.html`, `interiors.css`, `app.js` | The page itself. Shared colours, fonts, nav and logo come from `../assets/`. |
| `google-calendar/Code.gs` | The free connector: emails you each booking with an Apple Calendar invite and keeps the page's free times up to date. |

## How a booking works

1. The client adds services, picks a day and an arrival time, and fills in name, phone, address and town.
2. They tap **Solicitar cita**:
   - **With the connector set up:** you get an **email** with all the details and a **📅 Añadir al Calendario** button (plus a `.ics` invite attached). Tapping it on your iPhone or Mac adds the job to Apple Calendar. The time is blocked on the page right away.
   - **Without it:** WhatsApp opens with the full request already written to you.
3. The client sees how to pay the $100 deposit (ATH Móvil or PayPal) within 24 hours, plus a button to send you the receipt on WhatsApp. The balance is paid on the day by cash, ATH Móvil or PayPal.
4. **When the deposit arrives,** tap **Añadir al Calendario** in the email and save it to your **Redline** calendar. If no deposit arrives, do nothing: the time frees itself after 48 hours.

**To block time off,** add an event to your Redline calendar in the Apple Calendar app. All-day events block the whole day.

## Connect Apple Calendar + email (about 15 minutes, free)

The connector is a small free script that runs in a Google account (any Gmail works). It sends you the booking emails and reads your Apple calendar's busy times. Your bookings live in Apple Calendar.

### A. Make a "Redline" calendar you can share (iPhone)
1. Open **Calendar → Calendars (bottom) → Add Calendar → Add Calendar**, name it **Redline**, and pick red. Make sure it's under **iCloud**.
2. Tap the **ⓘ** next to **Redline**, turn on **Public Calendar**, then tap **Share Link… → Copy**. It starts with `webcal://`.
   - Only the script uses this link; it never appears on the website, which only ever sees busy times. Still, don't post the link anywhere.

### B. Set up the connector (computer)
1. Go to **https://script.google.com**, click **New project**, delete the sample code, and paste everything from `google-calendar/Code.gs`.
2. At the top, in `SETTINGS`, paste your link: `ICLOUD_CALENDAR_URL: 'webcal://…',`
   - Want bookings emailed somewhere other than that Gmail (e.g. your iCloud email)? Put it in `NOTIFY_EMAIL`.
3. **Save**, then **⚙️ Project Settings → Time zone → (GMT-04:00) Puerto Rico**.
4. In the editor, pick **`authorize`** in the function dropdown and click **Run**. Allow the permissions (**Advanced → Go to … (unsafe) → Allow**; "unsafe" only means Google hasn't reviewed your own script). You should receive a "connector is working ✅" email.
5. **Deploy → New deployment →** gear icon → **Web app**. **Execute as: Me**, **Who has access: Anyone** → **Deploy**. Copy the **Web app URL** (ends in `/exec`).
6. Put it in `config.js`: `calendarApiUrl: "https://script.google.com/macros/s/…/exec",` and publish the site again.

The calendar on the page now shows "● Horarios en vivo" (live times).

**Tip:** read booking emails in the iPhone **Mail** app (add your Gmail there) so the attached invite opens straight in Calendar. The **Añadir al Calendario** button works from any mail app.

**Using Google Calendar instead?** Set `MODE: 'google'` in `Code.gs`. Bookings then go straight into Google Calendar as yellow "⏳ PENDIENTE" events, and you still get the email.

**If you edit `Code.gs` later:** Deploy → Manage deployments → ✏️ → Version: *New version* → Deploy. The URL stays the same.

**Limits:** repeating events (e.g. "every Monday") in the Redline calendar only block their first time, so use one-off events there. Google allows about 100 emails a day on a free account, which is plenty.

## Putting it online

This page is one section of the RedlineHQ site. See `../README.md` for how the whole site goes live on **redlinehq.work**; this page will be at **redlinehq.work/interiors/**.
