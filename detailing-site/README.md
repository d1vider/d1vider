# Redline Interiors — Prices & Booking Page

One-page site (Spanish + English) where clients see your prices, pick a free day and time in the San Juan metro area, and request a booking with a $100 deposit by ATH Móvil.

## Files

| File | What it is |
|---|---|
| `config.js` | **Your settings.** Name, prices, hours, towns, deposit, About text, photos. The only file you normally edit. |
| `index.html`, `styles.css`, `app.js` | The page itself. |
| `google-calendar/Code.gs` | The free connector that links the page to your Google Calendar. |

## How a booking works

1. The client adds services, picks a day and an arrival time, and fills in name, phone, address and town.
2. They tap **Solicitar cita**:
   - **With Google Calendar connected:** a yellow **⏳ PENDIENTE** event appears in your calendar right away, with all the client's details, and you get an email. That time disappears from the page for everyone else.
   - **Without it:** WhatsApp opens with the full request already written to you.
3. The client sees instructions to send the deposit by ATH Móvil within 24 hours, plus a button to send you the receipt on WhatsApp.
4. When the deposit arrives, change the event title to **✅** and its colour to red. If it doesn't arrive, delete the event and the time becomes free again.

**To block time off,** just add an event to your Google Calendar. All-day events block the whole day.

## Connect Google Calendar (about 10 minutes, free)

1. On a computer, go to **https://script.google.com** (signed in to the Google account whose calendar you want) and click **New project**.
2. Delete the sample code, paste in everything from `google-calendar/Code.gs`, and click **Save**. Name the project "Redline booking".
3. Click the **⚙️ Project Settings** gear, set **Time zone** to **(GMT-04:00) Puerto Rico**.
4. Back in the editor, choose the function **`authorize`** in the dropdown at the top and click **Run**. Google will ask for permission: click **Review permissions**, choose your account, then **Advanced → Go to Redline booking (unsafe) → Allow**. ("Unsafe" just means Google hasn't reviewed your own script.)
5. Click **Deploy → New deployment**. Click the gear next to "Select type" and pick **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
7. Paste it into `config.js` as `calendarApiUrl: "https://script.google.com/macros/s/…/exec",` and publish the site again.

The page now shows "● Horarios en vivo" (live times) next to the calendar.

**Seeing it on your iPhone:** go to Settings → Calendar → Accounts → Add Account → Google and turn on Calendars. Bookings will show in the Apple Calendar app too.

**If you edit `Code.gs` later:** Deploy → Manage deployments → ✏️ → Version: *New version* → Deploy. The URL stays the same.

## Put it online for free (GitHub Pages)

Repo **Settings → Pages → Deploy from a branch**, pick the branch and `/ (root)`, then Save. The site will be at `https://<username>.github.io/<repo>/detailing-site/`.
