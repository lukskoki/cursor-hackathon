export function isNonEmpty(s: string) {
  return s.trim().length > 0;
}

export function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
