export function isNonEmpty(s: string) {
  return s.trim().length > 0;
}

export function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const MIN_PASSWORD_LEN = 6;

export function isPasswordValid(s: string) {
  return s.length >= MIN_PASSWORD_LEN;
}

export function minPasswordLength() {
  return MIN_PASSWORD_LEN;
}

/** Croatian OIB: 11 digits with valid control number. */
export function isValidOib(raw: string): boolean {
  const digits = raw.replace(/\s/g, "");
  if (!/^\d{11}$/.test(digits)) {
    return false;
  }
  let control = 10;
  for (let i = 0; i < 10; i++) {
    control += parseInt(digits.charAt(i), 10);
    control %= 10;
    if (control === 0) {
      control = 10;
    }
    control *= 2;
    control %= 11;
  }
  let check = 11 - control;
  if (check === 10) {
    check = 0;
  }
  return check === parseInt(digits.charAt(10), 10);
}

export function normalizeOib(raw: string): string {
  return raw.replace(/\s/g, "");
}
