import { describe, expect, it } from 'vitest';
import {
  formatDateRange,
  formatDayMonth,
  formatFlexDate,
  formatMonthYear,
  formatVenueLine,
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

  it('renders Chinese dates without English month names', () => {
    expect(formatFlexDate('2026', 'full', 'zh')).toBe('2026年');
    expect(formatFlexDate('2026-09', 'full', 'zh')).toBe('2026年9月');
    expect(formatFlexDate('2026-09-03', 'full', 'zh')).toBe('2026年9月3日');
    expect(formatFlexDate('2026-09-03', 'month', 'zh')).toBe('2026年9月');
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

  it('localizes Chinese ranges and the ongoing label', () => {
    expect(formatDateRange('2024-01', null, { locale: 'zh' })).toBe('2024年1月 – 至今');
    expect(formatDateRange('2024-01', '2025-06', { locale: 'zh' })).toBe('2024年1月 – 2025年6月');
  });
});

describe('news dates', () => {
  it('formats day-month and month-year', () => {
    expect(formatDayMonth('2026-09-03')).toBe('03 Sep');
    expect(formatDayMonth('2026-05')).toBe('May');
    expect(formatDayMonth('2026')).toBe('');
    expect(formatMonthYear('2026-09-03')).toBe('Sep 2026');
    expect(formatMonthYear('2026-05')).toBe('May 2026');
  });

  it('formats compact Chinese dates', () => {
    expect(formatDayMonth('2026-09-03', 'zh')).toBe('9月3日');
    expect(formatDayMonth('2026-05', 'zh')).toBe('5月');
    expect(formatMonthYear('2026-09-03', 'zh')).toBe('2026年9月');
  });
});

describe('formatVenueLine', () => {
  it('appends the year only when the venue does not already carry it', () => {
    expect(formatVenueLine('Journal of Building Performance Simulation', 2025)).toBe(
      'Journal of Building Performance Simulation, 2025',
    );
    expect(formatVenueLine('IBPSA-USA SimBuild 2026', 2026)).toBe('IBPSA-USA SimBuild 2026');
    expect(formatVenueLine('Building Simulation 2025, 19th Conference of IBPSA', 2025)).toBe(
      'Building Simulation 2025, 19th Conference of IBPSA',
    );
  });
  it('falls back to the year alone when there is no venue', () => {
    expect(formatVenueLine(null, 2027)).toBe('2027');
  });
  it('does not treat a longer number as the year', () => {
    expect(formatVenueLine('Workshop 20255', 2025)).toBe('Workshop 20255, 2025');
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
