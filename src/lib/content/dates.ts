/**
 * "Flex dates" are strings with optional precision: `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`.
 * They are kept as text (never `Date` objects) so that month-only values and time zones cannot drift.
 */
export interface FlexDateParts {
  year: number;
  month?: number;
  day?: number;
}

export function parseFlexDate(value: string): FlexDateParts {
  const [year, month, day] = value.split('-');
  const parts: FlexDateParts = { year: Number(year) };
  if (month !== undefined) parts.month = Number(month);
  if (day !== undefined) parts.day = Number(day);
  return parts;
}

/** Compares only the precision both dates share, so `2024` and `2024-05` are considered equal. */
export function compareFlexDates(a: string, b: string): number {
  const pa = parseFlexDate(a);
  const pb = parseFlexDate(b);
  if (pa.year !== pb.year) return pa.year - pb.year;
  if (pa.month === undefined || pb.month === undefined) return 0;
  if (pa.month !== pb.month) return pa.month - pb.month;
  if (pa.day === undefined || pb.day === undefined) return 0;
  return pa.day - pb.day;
}

/** Zero-padded `YYYY-MM-DD` key so plain string comparison sorts chronologically. */
export function flexDateSortKey(value: string): string {
  const { year, month = 0, day = 0 } = parseFlexDate(value);
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
