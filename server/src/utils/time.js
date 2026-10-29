import { cfg } from '../config.js';

// Current date and hour in the parlour's own time zone
export function nowInTz() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: cfg.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const allSlots = () =>
  Array.from({ length: cfg.close - cfg.open }, (_, i) => `${String(cfg.open + i).padStart(2, '0')}:00`);

// Slots a customer is allowed to book for a date (future only, inside the booking window)
export function bookableSlots(date) {
  const now = nowInTz();
  if (date < now.date || date > addDays(now.date, cfg.windowDays)) return [];
  return allSlots().filter((s) => date > now.date || Number(s.slice(0, 2)) > now.hour);
}
