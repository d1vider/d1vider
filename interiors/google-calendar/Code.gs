/**
 * Redline Interiors — booking connector
 * ------------------------------------------------------------
 * Runs free in a Google Apps Script project (script.google.com).
 * Every booking request is EMAILED to you with an "Add to Calendar" invite (.ics)
 * that opens straight in Apple Calendar on iPhone and Mac.
 *
 * Two ways to read your busy times (pick one in MODE):
 *   'apple'  -> reads a public iCloud calendar link (Calendar app > share > Public Calendar)
 *   'google' -> reads/writes your Google Calendar directly
 *
 * Full setup steps: README.md, section "Connect your calendar".
 */

const SETTINGS = {
  MODE: 'apple',                       // 'apple' or 'google'
  ICLOUD_CALENDAR_URL: '',             // apple mode: paste the webcal://... link from iCloud here
  GOOGLE_CALENDAR_NAME: 'Redline',     // google mode: bookings go in this Google calendar (created if missing)
  NOTIFY_EMAIL: 'citas@redlinehq.work', // where bookings are emailed (empty = this Google account's Gmail)
  BUSINESS_NAME: 'Redline Interiors',
  TIMEZONE: 'America/Puerto_Rico',
  BUFFER_MINUTES: 45,                  // keep equal to bufferMinutes in config.js
  HOLD_HOURS: 48,                      // apple mode: a request blocks its time this long, until you add it to your calendar
  MAX_DAYS_AHEAD: 90,
  MAX_REQUESTS_PER_HOUR: 30,           // simple spam guard
};

// ---------------------------------------------------------------- helpers
const json_ = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const fmt_ = (d, p) => Utilities.formatDate(d, SETTINGS.TIMEZONE, p);
const parse_ = (s) => Utilities.parseDate(s, SETTINGS.TIMEZONE, 'yyyy-MM-dd HH:mm');
const props_ = () => PropertiesService.getScriptProperties();
const notifyTo_ = () => SETTINGS.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
const webAppUrl_ = () => ScriptApp.getService().getUrl();
const escHtml_ = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function googleCal_() {
  const found = CalendarApp.getCalendarsByName(SETTINGS.GOOGLE_CALENDAR_NAME);
  if (found.length) return found[0];
  const cal = CalendarApp.createCalendar(SETTINGS.GOOGLE_CALENDAR_NAME, { color: CalendarApp.Color.RED, timeZone: SETTINGS.TIMEZONE });
  return cal;
}

/** Split [start, end) into per-day {date, from, to} blocks in Puerto Rico time. */
function toBlocks_(start, end) {
  const out = [];
  let cur = new Date(start.getTime());
  while (cur < end) {
    const day = fmt_(cur, 'yyyy-MM-dd');
    const nextMidnight = new Date(parse_(day + ' 00:00').getTime() + 864e5);
    const segEnd = end < nextMidnight ? end : nextMidnight;
    out.push({ date: day, from: fmt_(cur, 'HH:mm'), to: segEnd.getTime() === nextMidnight.getTime() ? '24:00' : fmt_(segEnd, 'HH:mm') });
    cur = segEnd;
  }
  return out;
}

// ---------------------------------------------------------------- iCloud (.ics feed) reading
function icsDate_(value, params) {
  if (/VALUE=DATE(?!-)/.test(params) || /^\d{8}$/.test(value)) {
    return { date: Utilities.parseDate(value.slice(0, 8), SETTINGS.TIMEZONE, 'yyyyMMdd'), allDay: true };
  }
  const tz = value.endsWith('Z') ? 'UTC' : ((params.match(/TZID=([^;:]+)/) || [])[1] || SETTINGS.TIMEZONE);
  return { date: Utilities.parseDate(value.replace('Z', '').slice(0, 15), tz, "yyyyMMdd'T'HHmmss"), allDay: false };
}

/** Busy intervals from the public iCloud calendar. Note: repeating events are read as their first time only. */
function icloudBusy_(from, until) {
  if (!SETTINGS.ICLOUD_CALENDAR_URL) return [];
  const url = SETTINGS.ICLOUD_CALENDAR_URL.replace(/^webcal:/i, 'https:');
  const text = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText().replace(/\r?\n[ \t]/g, '');
  const out = [];
  text.split('BEGIN:VEVENT').slice(1).forEach(function (chunk) {
    const body = chunk.split('END:VEVENT')[0];
    if (/^STATUS:CANCELLED/m.test(body) || /^TRANSP:TRANSPARENT/m.test(body)) return;
    const s = body.match(/^DTSTART([^:\r\n]*):([^\r\n]+)/m);
    if (!s) return;
    const e = body.match(/^DTEND([^:\r\n]*):([^\r\n]+)/m);
    const start = icsDate_(s[2].trim(), s[1]);
    const end = e ? icsDate_(e[2].trim(), e[1]).date
      : new Date(start.date.getTime() + (start.allDay ? 864e5 : 36e5));
    if (end > from && start.date < until) out.push([start.date, end]);
  });
  return out;
}

// ---------------------------------------------------------------- pending holds (apple mode)
function holds_() {
  const now = Date.now();
  return JSON.parse(props_().getProperty('holds') || '[]').filter((h) => h.until > now);
}
function saveHolds_(list) { props_().setProperty('holds', JSON.stringify(list)); }

function busyIntervals_(from, until) {
  if (SETTINGS.MODE === 'google') {
    return googleCal_().getEvents(from, until).map((ev) => [ev.getStartTime(), ev.getEndTime()]);
  }
  return icloudBusy_(from, until).concat(holds_().map((h) => [new Date(h.start), new Date(h.end)]));
}

// ---------------------------------------------------------------- .ics invite
function icsEscape_(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function icsFold_(line) {
  const out = []; while (line.length > 73) { out.push(line.slice(0, 73)); line = ' ' + line.slice(73); } out.push(line); return out.join('\r\n');
}
function buildIcs_(bk) {
  const z = (ms) => Utilities.formatDate(new Date(ms), 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Redline Interiors//Booking//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + bk.id + '@redline-interiors',
    'DTSTAMP:' + z(Date.now()),
    'DTSTART:' + z(bk.start), 'DTEND:' + z(bk.end),
    'SUMMARY:' + icsEscape_(bk.title),
    'LOCATION:' + icsEscape_(bk.location),
    'DESCRIPTION:' + icsEscape_(bk.description),
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape_(bk.title), 'END:VALARM',
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape_(bk.title), 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].map(icsFold_).join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------- web app
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'ics') {                                          // "Add to Calendar" link from the email
      const raw = props_().getProperty('bk_' + String(p.id || '').replace(/\W/g, ''));
      if (!raw) return ContentService.createTextOutput('Not found');
      return ContentService.createTextOutput(buildIcs_(JSON.parse(raw))).setMimeType(ContentService.MimeType.ICAL);
    }
    const days = Math.min(Number(p.days || 46), SETTINGS.MAX_DAYS_AHEAD);
    const now = new Date(), until = new Date(now.getTime() + days * 864e5);
    let busy = [];
    busyIntervals_(now, until).forEach(function (iv) { busy = busy.concat(toBlocks_(iv[0], iv[1])); });
    return json_({ ok: true, busy: busy });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.website) return json_({ ok: true });                         // bot filled the hidden field

    const cache = CacheService.getScriptCache();
    const count = Number(cache.get('reqs') || 0);
    if (count >= SETTINGS.MAX_REQUESTS_PER_HOUR) return json_({ ok: false, error: 'busy' });
    cache.put('reqs', String(count + 1), 3600);

    const str = (v, max) => String(v || '').trim().slice(0, max);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !/^\d{2}:\d{2}$/.test(b.start)) return json_({ ok: false, error: 'invalid' });
    const minutes = Number(b.minutes);
    if (!(minutes >= 10 && minutes <= 2880)) return json_({ ok: false, error: 'invalid' });   // up to 2 days of work
    const name = str(b.name, 80), phone = str(b.phone, 30), address = str(b.address, 160), town = str(b.town, 40);
    if (!name || !phone || !address) return json_({ ok: false, error: 'invalid' });

    const start = parse_(b.date + ' ' + b.start);
    const end = new Date(start.getTime() + minutes * 60000);
    if (start < new Date()) return json_({ ok: false, error: 'invalid' });

    // Re-check right now so two people can't grab the same time.
    const buf = SETTINGS.BUFFER_MINUTES * 60000;
    const clash = busyIntervals_(new Date(start.getTime() - buf), new Date(end.getTime() + buf))
      .some((iv) => iv[0].getTime() < end.getTime() + buf && iv[1].getTime() > start.getTime() - buf);
    if (clash) return json_({ ok: false, error: 'taken' });

    const digits = phone.replace(/\D/g, '');
    const wa = 'https://wa.me/' + (digits.length === 10 ? '1' + digits : digits);
    const services = (Array.isArray(b.services) ? b.services : []).slice(0, 30).map((s) => '• ' + str(s, 160));
    const total = Number(b.total || 0), deposit = Number(b.deposit || 0);
    const whenText = fmt_(start, 'EEE d MMM yyyy, h:mm a') + ' – ' + fmt_(end, 'h:mm a');
    const description = [
      'Depósito: $' + deposit + ' (pendiente)  ·  Total: $' + total + '  ·  Balance: $' + (total - deposit),
      '', 'Cliente: ' + name, 'Teléfono: ' + phone, 'WhatsApp: ' + wa,
      'Dirección: ' + address + (town ? ', ' + town : ''),
      '', 'Servicios:', services.join('\n'),
      b.notes ? '\nNotas: ' + str(b.notes, 600) : '',
    ].join('\n');

    const id = Utilities.getUuid().replace(/-/g, '');
    const bk = {
      id: id, start: start.getTime(), end: end.getTime(),
      title: SETTINGS.BUSINESS_NAME + ' · ' + name + ' · ' + (town || 'PR'),
      location: address + (town ? ', ' + town : '') + ', Puerto Rico',
      description: description,
    };
    props_().setProperty('bk_' + id, JSON.stringify(bk));
    cleanup_();

    if (SETTINGS.MODE === 'google') {
      const ev = googleCal_().createEvent('⏳ PENDIENTE · ' + name + ' · ' + (town || 'PR'), start, end,
        { description: description + '\n\nAl recibir el depósito: cambia el título a ✅ y el color a rojo.', location: bk.location });
      ev.setColor(CalendarApp.EventColor.YELLOW);
      ev.removeAllReminders();
      ev.addPopupReminder(24 * 60);
      ev.addPopupReminder(60);
    } else {
      const holds = holds_();
      holds.push({ id: id, start: bk.start, end: bk.end, until: Date.now() + SETTINGS.HOLD_HOURS * 36e5 });
      saveHolds_(holds);
    }

    const addUrl = webAppUrl_() + '?action=ics&id=' + id;
    const html =
      '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px">' +
      '<h2 style="margin:0 0 4px">Nueva solicitud de cita</h2>' +
      '<p style="margin:0 0 16px;color:#555">' + escHtml_(whenText) + '</p>' +
      '<p>' + (SETTINGS.MODE === 'google' ? '' : '<a href="' + addUrl + '" style="background:#d71920;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">📅 Añadir al Calendario</a>') +
      '&nbsp; <a href="' + wa + '" style="color:#d71920;font-weight:700">Escribir por WhatsApp</a></p>' +
      '<pre style="white-space:pre-wrap;font:14px/1.5 inherit;background:#f3f4f5;padding:14px;border-radius:8px">' + escHtml_(description) + '</pre>' +
      '<p style="color:#777;font-size:13px">' + (SETTINGS.MODE === 'google'
        ? 'Ya está en tu calendario Redline como ⏳ PENDIENTE, con recordatorios 1 día y 1 hora antes. Cuando recibas el depósito, cambia el título a ✅. Si no llega, borra el evento y la hora queda libre en la página.'
        : 'Esta hora queda bloqueada en la página por ' + SETTINGS.HOLD_HOURS + ' horas. Cuando recibas el depósito, toca "Añadir al Calendario" (o abre el archivo .ics adjunto) y guárdala en tu calendario Redline para que siga bloqueada. Si no llega el depósito, no hagas nada y la hora se libera sola.') +
      '</p></div>';
    MailApp.sendEmail({
      to: notifyTo_(),
      subject: (SETTINGS.MODE === 'google' ? '✅ Cita añadida a tu calendario: ' : '📅 Nueva cita: ') + name + ' · ' + fmt_(start, 'EEE d MMM, h:mm a'),
      htmlBody: html,
      body: whenText + '\n\n' + description + '\n\nAñadir al calendario: ' + addUrl,
      attachments: SETTINGS.MODE === 'google' ? [] : [Utilities.newBlob(buildIcs_(bk), 'text/calendar', 'cita-redline.ics')],
    });
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/** Forget booking details older than 60 days. */
function cleanup_() {
  const all = props_().getProperties(), cutoff = Date.now() - 60 * 864e5;
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('bk_') === 0) { try { if (JSON.parse(all[k]).end < cutoff) props_().deleteProperty(k); } catch (e) { props_().deleteProperty(k); } }
  });
  saveHolds_(holds_());
}

/** Run once from the editor: grants permissions and sends you a test email. */
function authorize() {
  if (SETTINGS.MODE === 'google') Logger.log('Google Calendar: ' + googleCal_().getName());
  else Logger.log('iCloud busy times found: ' + icloudBusy_(new Date(), new Date(Date.now() + 30 * 864e5)).length);
  MailApp.sendEmail(notifyTo_(), 'Redline booking connector is working ✅', 'Las solicitudes de cita llegarán a este email.');
  Logger.log('Test email sent to ' + notifyTo_());
}
