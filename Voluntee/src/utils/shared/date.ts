export function formatIsoDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatIsoDate(iso);
}

export function formatStartsInLabel(startsAtIso: string): string {
  const start = new Date(startsAtIso).getTime();
  if (Number.isNaN(start)) return "Upcoming";
  const diff = start - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days <= 0) return "Starts today";
  if (days === 1) return "Starts in 1 day";
  return `Starts in ${days} days`;
}
