import { describe, expect, it } from 'vitest';
import {
  formatDateRange,
  formatDayMonth,
  formatFlexDate,
  formatMonthYear,
  isExternalUrl,
  NEWS_TYPE_LABELS,
  PUBLICATION_STATUS_LABELS,
  splitAuthors,
} from '../src/lib/content/format';

describe('formatFlexDate', () => {
  it('renders each precision', () => {
    expect(formatFlexDate('2026')).toBe('2026');
    expect(formatFlexDate('2026-09')).toBe('Sep 2026');
    expect(formatFlexDate('2026-09-03')).toBe('3 Sep 2026');
    expect(formatFlexDate('2026-09-03', 'month')).toBe('Sep 2026');
  });
});

describe('formatDateRange', () => {
  it('handles ongoing, finished, collapsed, and partial ranges', () => {
    expect(formatDateRange('2024-01', null)).toBe('Jan 2024 – Present');
    expect(formatDateRange('2024-01', null, { present: 'Ongoing' })).toBe('Jan 2024 – Ongoing');
    expect(formatDateRange('2024-01', '2025-06')).toBe('Jan 2024 – Jun 2025');
    expect(formatDateRange('2024', '2024')).toBe('2024');
    expect(formatDateRange('2024-03-01', '2024-03-20')).toBe('Mar 2024');
    expect(formatDateRange(undefined, '2023-05')).toBe('May 2023');
    expect(formatDateRange(undefined, null)).toBe('');
    expect(formatDateRange('2024-01', undefined)).toBe('Jan 2024');
  });
});

describe('news dates', () => {
  it('formats day-month and month-year', () => {
    expect(formatDayMonth('2026-09-03')).toBe('03 Sep');
    expect(formatMonthYear('2026-09-03')).toBe('Sep 2026');
  });
});

describe('splitAuthors', () => {
  it('marks the site owner regardless of punctuation and case', () => {
    const parts = splitAuthors(['A. Author', 'C. Li', 'c li', 'Li, C.', 'D. Other'], ['Chengxuan Li', 'C. Li', 'Li, C.']);
    expect(parts.map((part) => part.isSelf)).toEqual([false, true, true, true, false]);
    expect(parts[1].name).toBe('C. Li');
  });
});

describe('labels and urls', () => {
  it('has a label for every status and news type', () => {
    expect(PUBLICATION_STATUS_LABELS['in-press']).toBe('In press');
    expect(NEWS_TYPE_LABELS.other).toBe('Update');
  });
  it('detects external urls', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('mailto:someone@example.com')).toBe(true);
    expect(isExternalUrl('/projects/')).toBe(false);
    expect(isExternalUrl('#publications')).toBe(false);
  });
});
