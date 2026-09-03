import { describe, expect, it } from 'vitest';
import { compareFlexDates, flexDateSortKey, parseFlexDate } from '../src/lib/content/dates';

describe('parseFlexDate', () => {
  it('splits year, month, and day when present', () => {
    expect(parseFlexDate('2026')).toEqual({ year: 2026 });
    expect(parseFlexDate('2026-09')).toEqual({ year: 2026, month: 9 });
    expect(parseFlexDate('2026-09-03')).toEqual({ year: 2026, month: 9, day: 3 });
  });
});

describe('compareFlexDates', () => {
  it('orders by the components both dates share', () => {
    expect(compareFlexDates('2025', '2024')).toBeGreaterThan(0);
    expect(compareFlexDates('2024-03', '2024-05')).toBeLessThan(0);
    expect(compareFlexDates('2024-05-01', '2024-05-09')).toBeLessThan(0);
  });
  it('treats a coarser date as equal when the shared components match', () => {
    expect(compareFlexDates('2024', '2024-05')).toBe(0);
    expect(compareFlexDates('2024-05', '2024-05-09')).toBe(0);
  });
});

describe('flexDateSortKey', () => {
  it('pads missing components so string order is chronological', () => {
    const keys = ['2024-03-15', '2024', '2024-03', '2023-12'].map(flexDateSortKey).sort();
    expect(keys).toEqual(['2023-12-00', '2024-00-00', '2024-03-00', '2024-03-15']);
  });
});
