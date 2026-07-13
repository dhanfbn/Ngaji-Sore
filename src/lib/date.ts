/**
 * The rebuilt v2 sheets mix date formats between tabs (ISO "YYYY-MM-DD" in
 * some, "DD/MM/YYYY" in others) — new Date(str) misparses the latter as
 * MM/DD/YYYY. Parse both explicitly instead of trusting the native parser.
 */
export function parseFlexibleDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const dmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}
