/**
 * Redline Interiors — Google Calendar connector
 * ------------------------------------------------------------
 * Paste this whole file into a Google Apps Script project
 * (script.google.com) and deploy it as a Web app.
 * Full steps: see README.md, section "Connect Google Calendar".
 *
 *  GET  ?action=busy&days=46  -> your busy times (no names or details, just times)
 *  POST {booking JSON}        -> adds a "PENDIENTE" event to your calendar
 */

const SETTINGS = {
  CALENDAR_ID: 'primary',             // 'primary' = your main Google Calendar
  TIMEZONE: 'America/Puerto_Rico',
  BUFFER_MINUTES: 45,                 // keep equal to bufferMinutes in config.js
  MAX_DAYS_AHEAD: 90,
  MAX_REQUESTS_PER_HOUR: 15,          // simple spam guard
  NOTIFY_EMAIL: true,                 // also email you when a booking arrives
};

function calendar_() {
  return SETTINGS.CALENDAR_ID === 'primary'
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(SETTINGS.CALENDAR_ID);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

const fmt_ = (d, pattern) => Utilities.formatDate(d, SETTINGS.TIMEZONE, pattern);
const parse_ = (s) => Utilities.parseDate(s, SETTINGS.TIMEZONE, 'yyyy-MM-dd HH:mm');

/** Split an event into per-day {date, from, to} blocks in Puerto Rico time. */
function toBlocks_(start, end) {
  const out = [];
  let cur = new Date(start.getTime());
  while (cur < end) {
    const day = fmt_(cur, 'yyyy-MM-dd');
    const nextMidnight = new Date(parse_(day + ' 00:00').getTime() + 24 * 3600 * 1000);
    const segEnd = end < nextMidnight ? end : nextMidnight;
    out.push({
      date: day,
      from: fmt_(cur, 'HH:mm'),
      to: segEnd.getTime() === nextMidnight.getTime() ? '24:00' : fmt_(segEnd, 'HH:mm'),
    });
    cur = segEnd;
  }
  return out;
}

/** Busy times. All-day events (vacations, days off) block the whole day. */
function doGet(e) {
  try {
    const days = Math.min(Number((e && e.parameter && e.parameter.days) || 46), SETTINGS.MAX_DAYS_AHEAD);
    const now = new Date();
    const until = new Date(now.getTime() + days * 24 * 3600 * 1000);
    let busy = [];
    calendar_().getEvents(now, until).forEach(function (ev) {
      busy = busy.concat(toBlocks_(ev.getStartTime(), ev.getEndTime()));
    });
    return json_({ ok: true, busy: busy });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

/** New booking request -> calendar event (yellow, "PENDIENTE" until you confirm). */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.website) return json_({ ok: true });                       // bot filled the hidden field

    const cache = CacheService.getScriptCache();
    const count = Number(cache.get('reqs') || 0);
    if (count >= SETTINGS.MAX_REQUESTS_PER_HOUR) return json_({ ok: false, error: 'busy' });
    cache.put('reqs', String(count + 1), 3600);

    const str = (v, max) => String(v || '').trim().slice(0, max);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date) || !/^\d{2}:\d{2}$/.test(b.start)) return json_({ ok: false, error: 'invalid' });
    const minutes = Number(b.minutes);
    if (!(minutes >= 10 && minutes <= 900)) return json_({ ok: false, error: 'invalid' });
    const name = str(b.name, 80), phone = str(b.phone, 30), address = str(b.address, 160), town = str(b.town, 40);
    if (!name || !phone || !address) return json_({ ok: false, error: 'invalid' });

    const start = parse_(b.date + ' ' + b.start);
    const end = new Date(start.getTime() + minutes * 60000);
    if (start < new Date()) return json_({ ok: false, error: 'invalid' });

    // Re-check the calendar right now so two people can't grab the same time.
    const buf = SETTINGS.BUFFER_MINUTES * 60000;
    const clash = calendar_().getEvents(new Date(start.getTime() - buf), new Date(end.getTime() + buf));
    if (clash.length) return json_({ ok: false, error: 'taken' });

    const services = (Array.isArray(b.services) ? b.services : []).slice(0, 30).map(function (s) { return '• ' + str(s, 160); });
    const description = [
      'PENDIENTE: esperando depósito de $' + Number(b.deposit || 0),
      '',
      'Cliente: ' + name,
      'Teléfono: ' + phone,
      'WhatsApp: https://wa.me/' + phone.replace(/\D/g, '').replace(/^(\d{10})$/, '1$1'),
      'Dirección: ' + address + (town ? ', ' + town : ''),
      '',
      'Servicios:',
      services.join('\n'),
      '',
      'Total estimado: $' + Number(b.total || 0),
      'Depósito: $' + Number(b.deposit || 0),
      b.notes ? '\nNotas: ' + str(b.notes, 600) : '',
      '',
      'Al recibir el depósito: cambia el título de "⏳ PENDIENTE" a "✅" y el color a rojo.',
    ].join('\n');

    const ev = calendar_().createEvent('⏳ PENDIENTE · ' + name + ' · ' + (town || 'PR'), start, end, {
      description: description,
      location: address + (town ? ', ' + town + ', PR' : ', PR'),
    });
    ev.setColor(CalendarApp.EventColor.YELLOW);
    ev.addPopupReminder(60 * 24);
    ev.addPopupReminder(60);

    if (SETTINGS.NOTIFY_EMAIL) {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
        'Nueva cita: ' + name + ' · ' + b.date + ' ' + b.start, description);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}

/** Run this once from the editor to grant calendar + email permission. */
function authorize() {
  calendar_().getEvents(new Date(), new Date(Date.now() + 86400000));
  Logger.log('OK, connected to: ' + calendar_().getName());
}
