export const rs = (n) => `\u20B9${Number(n).toLocaleString('en-IN')}`;

export function time12(t) {
  const h = Number(t.slice(0, 2));
  return `${h % 12 || 12}:${t.slice(3, 5)} ${h < 12 ? 'AM' : 'PM'}`;
}

export const longDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export function nextDays(n) {
  const out = [];
  const t = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
    const pad = (x) => String(x).padStart(2, '0');
    out.push({
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      wd: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: d.getDate(),
      mon: d.toLocaleDateString('en-IN', { month: 'short' }),
    });
  }
  return out;
}
