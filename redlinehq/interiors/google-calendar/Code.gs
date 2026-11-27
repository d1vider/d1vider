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
  CLIENT_EMAIL_FROM: 'citas@redlinehq.work', // quote confirmations to clients are sent from this address only ('' = off)
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
  if (p.action === 'admin') return adminPage_();
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

    // Anti-spam: once a TURNSTILE_SECRET is saved in Project Settings → Script Properties,
    // every request must carry a valid Cloudflare Turnstile token from the booking page.
    const tsSecret = props_().getProperty('TURNSTILE_SECRET');
    if (tsSecret) {
      const check = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'post', muteHttpExceptions: true,
        payload: { secret: tsSecret, response: String(b.turnstile || '') },
      });
      let passed = false;
      try { passed = JSON.parse(check.getContentText()).success === true; } catch (e) {}
      if (!passed) return json_({ ok: false, error: 'captcha' });
    }

    const cache = CacheService.getScriptCache();
    const count = Number(cache.get('reqs') || 0);
    if (count >= SETTINGS.MAX_REQUESTS_PER_HOUR) return json_({ ok: false, error: 'busy' });
    cache.put('reqs', String(count + 1), 3600);

    const str = (v, max) => String(v || '').trim().slice(0, max);
    if (b.type === 'quote') return quote_(b, str);   // Redline Technologies quote form
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !/^\d{2}:\d{2}$/.test(b.start)) return json_({ ok: false, error: 'invalid' });
    const minutes = Number(b.minutes);
    if (!(minutes >= 10 && minutes <= 900)) return json_({ ok: false, error: 'toolong' });   // max 15 h per booking
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
      (deposit > 0
        ? 'Depósito: $' + deposit + ' (pendiente)  ·  Total: $' + total + '  ·  Balance: $' + (total - deposit)
        : 'Sin depósito  ·  Total: $' + total + ' (se paga el día del servicio)'),
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
        { description: description + (deposit > 0 ? '\n\nAl recibir el depósito: cambia el título a ✅ y el color a rojo.' : '\n\nSin depósito: confírmale al cliente por WhatsApp y cambia el título a ✅.'), location: bk.location });
      ev.setColor(CalendarApp.EventColor.YELLOW);
      ev.removeAllReminders();
      ev.addPopupReminder(24 * 60);
      ev.addPopupReminder(60);
      logBooking_({ when: start, name: name, phone: phone, address: address + (town ? ', ' + town : ''), services: services.join('\n'), total: total, deposit: deposit, eventId: ev.getId() });
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
        ? 'Ya está en tu calendario Redline como ⏳ PENDIENTE, con recordatorios 1 día y 1 hora antes. ' + (deposit > 0 ? 'Cuando recibas el depósito, márcala como recibida en tu página de admin (o cambia el título a ✅). Si no llega, cancélala y la hora queda libre en la página.' : 'Este trabajo no lleva depósito: confírmale al cliente por WhatsApp y márcala como confirmada en tu página de admin.')
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

/** Quote request from redlinehq.work/tech: email it to you; "Reply" goes to the client if they left an email. */
function quote_(b, str) {
  const name = str(b.name, 80), phone = str(b.phone, 30), email = str(b.email, 120), details = str(b.details, 1200);
  if (!name || !phone || !details) return json_({ ok: false, error: 'invalid' });
  const service = str(b.service, 60) || 'Otro', budget = str(b.budget, 40);
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const digits = phone.replace(/\D/g, '');
  const wa = 'https://wa.me/' + (digits.length === 10 ? '1' + digits : digits);
  const text = [
    'Servicio: ' + service, budget ? 'Presupuesto: ' + budget : null, '', details, '',
    'Nombre: ' + name, 'Teléfono: ' + phone, 'WhatsApp: ' + wa,
    okEmail ? 'Email: ' + email : 'Email: (no lo dejó)',
    'Idioma: ' + (b.lang === 'en' ? 'English' : 'Español'),
  ].filter(function (x) { return x !== null; }).join('\n');
  const html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px">' +
    '<h2 style="margin:0 0 4px">Nueva solicitud de cotización</h2>' +
    '<p style="margin:0 0 16px;color:#555">' + escHtml_(service) + (budget ? ' · ' + escHtml_(budget) : '') + '</p>' +
    '<p><a href="' + wa + '" style="background:#d71920;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Contestar por WhatsApp</a>' +
    (okEmail ? '&nbsp; <span style="color:#555">o toca Responder para contestar por email</span>' : '') + '</p>' +
    '<pre style="white-space:pre-wrap;font:14px/1.5 inherit;background:#f3f4f5;padding:14px;border-radius:8px">' + escHtml_(text) + '</pre></div>';
  const msg = { to: notifyTo_(), subject: '💬 Cotización: ' + service + ' · ' + name, htmlBody: html, body: text };
  if (okEmail) msg.replyTo = email;
  MailApp.sendEmail(msg);
  logQuote_({ name: name, phone: phone, email: okEmail ? email : '', service: service, budget: budget, details: details });
  let confirmed = false;
  try { if (okEmail) confirmed = confirmQuote_(email, name, service, details, b.lang); } catch (e) {}  // never fail the quote over this
  return json_({ ok: true, confirmed: confirmed });
}

/**
 * Sends the client a short "I got your request" email, but ONLY from your business
 * address (SETTINGS.CLIENT_EMAIL_FROM), so your personal Gmail is never shown to clients.
 * Gmail must have that address under Settings → Accounts → "Send mail as".
 * Returns true if the email was sent.
 */
function confirmQuote_(to, name, service, details, lang) {
  const from = SETTINGS.CLIENT_EMAIL_FROM;
  if (!from) return false;
  try {
    if (GmailApp.getAliases().indexOf(from) === -1) { Logger.log('Client confirmation skipped: add ' + from + ' to Gmail "Send mail as".'); return false; }
    const en = lang === 'en', first = name.split(/\s+/)[0];
    const subject = en ? 'Got your request · RedlineHQ' : 'Recibí tu solicitud · RedlineHQ';
    const lines = en
      ? ['Hi ' + first + ',', '', 'Thanks for reaching out. I got your request and will reply on WhatsApp or by email within 24 hours.', '', 'Service: ' + service, 'What you need: ' + details, '', 'If it\'s urgent, message me on WhatsApp: https://wa.me/17879100777', '', '— RedlineHQ · redlinehq.work']
      : ['Hola ' + first + ',', '', 'Gracias por escribirme. Recibí tu solicitud y te contesto por WhatsApp o email en menos de 24 horas.', '', 'Servicio: ' + service, 'Lo que necesitas: ' + details, '', 'Si es urgente, escríbeme por WhatsApp: https://wa.me/17879100777', '', '— RedlineHQ · redlinehq.work'];
    const html =
      '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;color:#111">' +
      '<div style="background:#0b0c0f;border-radius:12px;padding:18px 20px;margin-bottom:18px"><span style="color:#fff;font-weight:800;font-size:20px;letter-spacing:.5px">REDLINE<span style="color:#e3161d">HQ</span></span></div>' +
      '<p>' + escHtml_(lines[0]) + '</p><p>' + escHtml_(lines[2]) + '</p>' +
      '<div style="background:#f3f4f5;border-radius:10px;padding:14px 16px;margin:16px 0"><p style="margin:0 0 6px"><b>' + (en ? 'Service' : 'Servicio') + ':</b> ' + escHtml_(service) + '</p>' +
      '<p style="margin:0;white-space:pre-wrap"><b>' + (en ? 'What you need' : 'Lo que necesitas') + ':</b> ' + escHtml_(details) + '</p></div>' +
      '<p><a href="https://wa.me/17879100777" style="background:#1fae55;color:#fff;padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">' + (en ? 'Message me on WhatsApp' : 'Escríbeme por WhatsApp') + '</a></p>' +
      '<p style="color:#777;font-size:13px;margin-top:22px">RedlineHQ · <a href="https://redlinehq.work" style="color:#e3161d">redlinehq.work</a> · ' + (en ? 'San Juan metro area, Puerto Rico' : 'Área Metropolitana, Puerto Rico') + '</p></div>';
    GmailApp.sendEmail(to, subject, lines.join('\n'), { from: from, name: 'RedlineHQ', replyTo: from, htmlBody: html });
    return true;
  } catch (e) {
    try { Logger.log('Client confirmation failed: ' + e); } catch (_) {}
    return false;
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
  Logger.log('Hoja de solicitudes: ' + sheetFile_().getUrl());
  if (SETTINGS.CLIENT_EMAIL_FROM) Logger.log('Confirmaciones a clientes desde ' + SETTINGS.CLIENT_EMAIL_FROM + ': ' + (GmailApp.getAliases().indexOf(SETTINGS.CLIENT_EMAIL_FROM) > -1 ? 'listo ✓' : 'falta añadirlo en Gmail → Configuración → Cuentas → Enviar como'));
  MailApp.sendEmail(notifyTo_(), 'Redline booking connector is working ✅', 'Las solicitudes de cita llegarán a este email.');
  Logger.log('Test email sent to ' + notifyTo_());
}

// ================================================================ admin page (only you)
// Open it with the second deployment ("Who has access: Only myself"), adding ?action=admin to its URL.
// Google asks you to sign in, and every admin action re-checks that it's you.
const ADMIN_STATUSES = ['Nuevo', 'Contestado', 'Cerrado'];

function isOwner_() {
  try {
    const me = Session.getActiveUser().getEmail();
    return !!me && me === Session.getEffectiveUser().getEmail();
  } catch (e) { return false; }
}
function requireOwner_() { if (!isOwner_()) throw new Error('No autorizado'); }

function adminPage_() {
  if (!isOwner_()) {
    return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;padding:2rem">No autorizado. Abre el enlace de administración con tu cuenta de Google.</p>');
  }
  return HtmlService.createHtmlOutput(ADMIN_HTML_).setTitle('Redline Admin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** The "Redline – Solicitudes" Google Sheet (created the first time). */
function sheetFile_() {
  const props = props_();
  const id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const ss = SpreadsheetApp.create('Redline – Solicitudes');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}
function sheet_(name, headers) {
  const ss = sheetFile_();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); }
  return sh;
}
const QUOTE_HEADERS_ = ['Fecha', 'Nombre', 'Teléfono', 'Email', 'Servicio', 'Presupuesto', 'Detalles', 'Estado'];
const BOOKING_HEADERS_ = ['Recibida', 'Cita', 'Cliente', 'Teléfono', 'Dirección', 'Servicios', 'Total', 'Depósito', 'ID evento'];

function logQuote_(q) {
  try { sheet_('Cotizaciones', QUOTE_HEADERS_).appendRow([new Date(), q.name, q.phone, q.email, q.service, q.budget, q.details, 'Nuevo']); } catch (e) {}
}
function logBooking_(r) {
  try { sheet_('Citas', BOOKING_HEADERS_).appendRow([new Date(), r.when, r.name, r.phone, r.address, r.services, r.total, r.deposit, r.eventId || '']); } catch (e) {}
}

/** Everything the admin page shows. */
function adminData() {
  requireOwner_();
  const now = new Date();
  const cal = googleCal_();
  const bookings = [], daysOff = [];
  cal.getEvents(new Date(now.getTime() - 864e5), new Date(now.getTime() + 120 * 864e5)).forEach(function (ev) {
    const desc = ev.getDescription() || '';
    const item = {
      id: ev.getId(), title: ev.getTitle(), start: ev.getStartTime().getTime(), end: ev.getEndTime().getTime(),
      location: ev.getLocation() || '', description: desc,
    };
    if (ev.isAllDayEvent()) { daysOff.push(item); return; }
    item.pending = /PENDIENTE/.test(item.title);
    item.confirmed = /CONFIRMADA|^✅/.test(item.title);
    item.wa = (desc.match(/https:\/\/wa\.me\/\d+/) || [''])[0];
    item.noDeposit = /^Sin depósito/.test(desc);
    bookings.push(item);
  });
  let quotes = [];
  try {
    const rows = sheet_('Cotizaciones', QUOTE_HEADERS_).getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const phone = String(r[2] || ''), digits = phone.replace(/\D/g, '');
      quotes.push({
        row: i + 1, date: r[0] instanceof Date ? r[0].getTime() : null, name: String(r[1] || ''), phone: phone,
        email: String(r[3] || ''), service: String(r[4] || ''), budget: String(r[5] || ''), details: String(r[6] || ''),
        status: ADMIN_STATUSES.indexOf(String(r[7])) >= 0 ? String(r[7]) : 'Nuevo',
        wa: digits ? 'https://wa.me/' + (digits.length === 10 ? '1' + digits : digits) : '',
      });
    }
  } catch (e) {}
  quotes.reverse();
  let sheetUrl = '';
  try { sheetUrl = sheetFile_().getUrl(); } catch (e) {}
  return { calendar: cal.getName(), now: now.getTime(), bookings: bookings, daysOff: daysOff, quotes: quotes.slice(0, 100), statuses: ADMIN_STATUSES, sheetUrl: sheetUrl };
}

function adminEvent_(id) {
  const ev = googleCal_().getEventById(String(id || ''));
  if (!ev) throw new Error('No encontré ese evento (¿ya fue borrado?)');
  return ev;
}
/** Deposit received (or no-deposit job confirmed): ⏳ PENDIENTE → ✅ CONFIRMADA, red. */
function adminConfirm(id) {
  requireOwner_();
  const ev = adminEvent_(id);
  ev.setTitle(ev.getTitle().replace('⏳ PENDIENTE', '✅ CONFIRMADA'));
  ev.setDescription((ev.getDescription() || '').replace('(pendiente)', '(recibido)'));
  ev.setColor(CalendarApp.EventColor.RED);
  return true;
}
/** Cancel a booking: deletes the event, so the time frees up on the website. */
function adminCancel(id) {
  requireOwner_();
  const ev = adminEvent_(id);
  if (ev.isAllDayEvent()) throw new Error('Eso es un día libre, no una cita');
  ev.deleteEvent();
  return true;
}
/** Day off: an all-day event blocks the whole day on the website. */
function adminAddDayOff(ds) {
  requireOwner_();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ds))) throw new Error('Fecha inválida');
  googleCal_().createAllDayEvent('🚫 Día libre', Utilities.parseDate(ds, SETTINGS.TIMEZONE, 'yyyy-MM-dd'));
  return true;
}
function adminRemoveDayOff(id) {
  requireOwner_();
  const ev = adminEvent_(id);
  if (!ev.isAllDayEvent()) throw new Error('Eso es una cita, no un día libre');
  ev.deleteEvent();
  return true;
}
function adminQuoteStatus(row, status) {
  requireOwner_();
  if (ADMIN_STATUSES.indexOf(status) < 0) throw new Error('Estado inválido');
  const sh = sheet_('Cotizaciones', QUOTE_HEADERS_);
  const r = Number(row);
  if (!(r >= 2 && r <= sh.getLastRow())) throw new Error('Fila inválida');
  sh.getRange(r, 8).setValue(status);
  return true;
}

// The admin page itself (served by adminPage_).
const ADMIN_HTML_ = `<!doctype html>
<html lang="es" data-theme="redline">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Redline Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/daisyui@5.7.50/daisyui.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.11"></script>
<style>
  [data-theme="redline"] { color-scheme: light; --color-base-100:#fff; --color-base-200:#f5f6f8; --color-base-300:#e6e8ec; --color-base-content:#101217;
    --color-primary:#e3161d; --color-primary-content:#fff; --color-secondary:#6b737b; --color-secondary-content:#fff; --color-accent:#ff6a3d; --color-accent-content:#fff;
    --color-neutral:#101217; --color-neutral-content:#f2f4f6; --color-info:#2f7bea; --color-info-content:#fff; --color-success:#16a34a; --color-success-content:#fff;
    --color-warning:#f59e0b; --color-warning-content:#111; --color-error:#e3161d; --color-error-content:#fff;
    --radius-selector:2rem; --radius-field:.75rem; --radius-box:1.25rem; --size-selector:.25rem; --size-field:.25rem; --border:1px; --depth:1; --noise:0; }
  body { font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--color-base-200); }
</style>
</head>
<body class="min-h-screen">
  <header class="sticky top-0 z-10 border-b border-base-300 bg-base-100/90 backdrop-blur">
    <div class="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
      <div class="min-w-0 flex-1">
        <div class="text-lg font-extrabold">Redline <span class="text-primary">Admin</span></div>
        <div id="sub" class="truncate text-xs text-base-content/60">Cargando…</div>
      </div>
      <a id="sheet" class="btn btn-ghost btn-sm" target="_blank" rel="noopener" hidden>Hoja</a>
      <a class="btn btn-ghost btn-sm" href="https://redlinehq.work" target="_blank" rel="noopener">Ver sitio</a>
      <button id="refresh" class="btn btn-outline btn-sm">Actualizar</button>
    </div>
  </header>

  <main class="mx-auto max-w-4xl px-4 py-5">
    <div id="stats" class="mb-5 grid grid-cols-3 gap-3"></div>
    <div role="tablist" class="tabs tabs-box mb-4 bg-base-100" id="tabs">
      <button role="tab" class="tab tab-active" data-tab="citas">Citas</button>
      <button role="tab" class="tab" data-tab="cotizaciones">Cotizaciones</button>
      <button role="tab" class="tab" data-tab="libres">Días libres</button>
    </div>
    <section id="citas" class="grid gap-3"></section>
    <section id="cotizaciones" class="grid gap-3" hidden></section>
    <section id="libres" hidden>
      <form id="dayoff-form" class="mb-4 flex flex-wrap items-end gap-2 rounded-box border border-base-300 bg-base-100 p-4">
        <label class="flex flex-col gap-1 text-sm font-medium">Bloquear un día<input id="dayoff-date" type="date" class="input" required></label>
        <button class="btn btn-primary">Añadir día libre</button>
        <p class="w-full text-xs text-base-content/60">El día queda bloqueado en la página de citas al instante.</p>
      </form>
      <div id="dayoff-list" class="grid gap-2"></div>
    </section>
    <p id="err" class="mt-4 text-sm font-medium text-error"></p>
  </main>
  <div id="toast" class="toast toast-center hidden"><div class="alert alert-success"><span id="toast-text"></span></div></div>

<script>
  var TZ = "America/Puerto_Rico", D = null, armed = null;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(ms, o) { return new Date(ms).toLocaleString("es-PR", Object.assign({ timeZone: TZ }, o)); }
  function dayName(ms) { var s = fmt(ms, { weekday: "long", day: "numeric", month: "long" }); return s.charAt(0).toUpperCase() + s.slice(1); }
  function clock(ms) { return fmt(ms, { hour: "numeric", minute: "2-digit" }); }
  function toast(t) { $("toast-text").textContent = t; $("toast").classList.remove("hidden"); setTimeout(function () { $("toast").classList.add("hidden"); }, 1800); }
  function run(fn, args, done) {
    $("err").textContent = "";
    var r = google.script.run
      .withSuccessHandler(function (res) { if (done) done(res); })
      .withFailureHandler(function (e) { $("err").textContent = "Error: " + ((e && e.message) || e); });
    r[fn].apply(r, args || []);
  }
  function load() { $("sub").textContent = "Cargando…"; run("adminData", [], function (d) { D = d; render(); }); }
  function stat(n, label, tone) {
    return '<div class="rounded-box border border-base-300 bg-base-100 p-4"><div class="text-2xl font-extrabold ' + (tone || "") + '">' + n + '</div><div class="text-xs text-base-content/60">' + label + '</div></div>';
  }
  function cleanTitle(t) { return t.replace(/^⏳ PENDIENTE · |^✅ CONFIRMADA · |^✅ ?/, ""); }

  function render() {
    var now = D.now;
    var upcoming = D.bookings.filter(function (b) { return b.end >= now; }).sort(function (a, b) { return a.start - b.start; });
    var pending = upcoming.filter(function (b) { return b.pending && !b.noDeposit; }).length;
    var toConfirm = upcoming.filter(function (b) { return b.pending && b.noDeposit; }).length;
    var fresh = D.quotes.filter(function (q) { return q.status === "Nuevo"; }).length;
    $("sub").textContent = "Calendario: " + D.calendar + " · actualizado " + clock(now);
    if (D.sheetUrl) { $("sheet").href = D.sheetUrl; $("sheet").hidden = false; }
    var realBookings = upcoming.filter(function (b) { return b.pending || b.confirmed; }).length;
    $("stats").innerHTML = stat(realBookings, "Próximas citas") + stat(pending, "Esperan depósito", pending ? "text-warning" : "") + (toConfirm ? stat(toConfirm, "Por confirmar", "text-warning") : "") + stat(fresh, "Cotizaciones nuevas", fresh ? "text-primary" : "");

    // bookings, grouped by day
    var html = "", lastDay = "";
    upcoming.forEach(function (b) {
      var d = dayName(b.start);
      if (d !== lastDay) { html += '<h3 class="mt-2 text-sm font-bold text-base-content/70">' + esc(d) + "</h3>"; lastDay = d; }
      var isBooking = b.pending || b.confirmed;
      var badge = b.pending ? '<span class="badge badge-warning badge-soft">' + (b.noDeposit ? 'Por confirmar · sin depósito' : 'Espera depósito') + '</span>' : b.confirmed ? '<span class="badge badge-success badge-soft">Confirmada</span>' : '<span class="badge badge-ghost">Otro evento</span>';
      html += '<div class="card border border-base-300 bg-base-100"><div class="card-body gap-2 p-4">' +
        '<div class="flex flex-wrap items-center justify-between gap-2"><div class="font-bold">' + clock(b.start) + "–" + clock(b.end) + " · " + esc(cleanTitle(b.title)) + "</div>" + badge + "</div>" +
        (b.location ? '<div class="text-sm text-base-content/70">' + esc(b.location) + "</div>" : "") +
        (b.description ? '<details class="text-sm"><summary class="cursor-pointer text-base-content/60">Detalles</summary><pre class="mt-2 whitespace-pre-wrap rounded-lg bg-base-200 p-3 font-sans text-xs">' + esc(b.description) + "</pre></details>" : "") +
        (isBooking ? '<div class="flex flex-wrap gap-2 pt-1">' +
          (b.wa ? '<a class="btn btn-sm btn-success btn-soft" target="_blank" rel="noopener" href="' + esc(b.wa) + '">WhatsApp</a>' : "") +
          (b.pending ? '<button class="btn btn-sm btn-primary" data-act="confirm" data-id="' + esc(b.id) + '">' + (b.noDeposit ? 'Confirmar cita ✓' : 'Depósito recibido ✓') + '</button>' : "") +
          '<button class="btn btn-sm btn-ghost text-error" data-act="cancel" data-id="' + esc(b.id) + '">Cancelar cita</button></div>' : "") +
        "</div></div>";
    });
    $("citas").innerHTML = html || '<div class="rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60">No hay citas próximas.</div>';

    // quotes
    $("cotizaciones").innerHTML = D.quotes.map(function (q) {
      var opts = D.statuses.map(function (s) { return '<option' + (s === q.status ? " selected" : "") + ">" + s + "</option>"; }).join("");
      return '<div class="card border border-base-300 bg-base-100"><div class="card-body gap-2 p-4">' +
        '<div class="flex flex-wrap items-center justify-between gap-2"><div><div class="font-bold">' + esc(q.name) + '</div><div class="text-xs text-base-content/60">' + esc(q.service) + (q.budget ? " · " + esc(q.budget) : "") + (q.date ? " · " + dayName(q.date) + ", " + clock(q.date) : "") + "</div></div>" +
        '<select class="select select-sm w-auto" data-act="status" data-row="' + q.row + '">' + opts + "</select></div>" +
        '<p class="whitespace-pre-wrap text-sm">' + esc(q.details) + "</p>" +
        '<div class="flex flex-wrap items-center gap-2 pt-1 text-sm">' +
          (q.wa ? '<a class="btn btn-sm btn-success btn-soft" target="_blank" rel="noopener" href="' + esc(q.wa) + '">WhatsApp</a>' : "") +
          (q.email ? '<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="mailto:' + esc(q.email) + '">Email</a>' : "") +
          '<span class="text-base-content/60">' + esc(q.phone) + (q.email ? " · " + esc(q.email) : "") + "</span></div>" +
        "</div></div>";
    }).join("") || '<div class="rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60">Todavía no hay cotizaciones.</div>';

    // days off
    var offs = D.daysOff.filter(function (o) { return o.end > now; }).sort(function (a, b) { return a.start - b.start; });
    $("dayoff-list").innerHTML = offs.map(function (o) {
      return '<div class="flex items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3"><div><div class="font-semibold">' + dayName(o.start + 12 * 36e5) + '</div><div class="text-xs text-base-content/60">' + esc(o.title) + '</div></div><button class="btn btn-sm btn-ghost text-error" data-act="dayoff-remove" data-id="' + esc(o.id) + '">Quitar</button></div>';
    }).join("") || '<p class="text-sm text-base-content/60">No hay días libres próximos.</p>';
  }

  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-tab]");
    if (tab) {
      document.querySelectorAll("[data-tab]").forEach(function (t) { t.classList.toggle("tab-active", t === tab); });
      ["citas", "cotizaciones", "libres"].forEach(function (id) { $(id).hidden = id !== tab.dataset.tab; });
      return;
    }
    var b = e.target.closest("button[data-act]"); if (!b) return;
    var act = b.dataset.act, id = b.dataset.id;
    if (act === "confirm") { b.disabled = true; run("adminConfirm", [id], function () { toast("Cita confirmada"); load(); }); }
    if (act === "cancel" || act === "dayoff-remove") {
      if (armed !== b) {                       // two taps so nothing gets deleted by accident
        if (armed) { armed.textContent = armed.dataset.label; armed.classList.remove("btn-error"); }
        armed = b; b.dataset.label = b.textContent; b.textContent = "¿Seguro? Toca otra vez"; b.classList.add("btn-error");
        setTimeout(function () { if (armed === b) { b.textContent = b.dataset.label; b.classList.remove("btn-error"); armed = null; } }, 4000);
        return;
      }
      armed = null; b.disabled = true;
      run(act === "cancel" ? "adminCancel" : "adminRemoveDayOff", [id], function () { toast(act === "cancel" ? "Cita cancelada: la hora quedó libre" : "Día libre quitado"); load(); });
    }
  });
  document.addEventListener("change", function (e) {
    var s = e.target.closest("select[data-act=status]"); if (!s) return;
    run("adminQuoteStatus", [Number(s.dataset.row), s.value], function () {
      D.quotes.forEach(function (q) { if (q.row === Number(s.dataset.row)) q.status = s.value; });
      render(); toast("Estado: " + s.value);
    });
  });
  $("dayoff-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("dayoff-date").value; if (!v) return;
    run("adminAddDayOff", [v], function () { $("dayoff-date").value = ""; toast("Día bloqueado"); load(); });
  });
  $("refresh").addEventListener("click", load);
  load();
</script>
</body>
</html>`;
