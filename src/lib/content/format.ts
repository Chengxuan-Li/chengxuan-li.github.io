import { parseFlexDate } from './dates';
import type { ExperienceData, NewsData, ProjectData, PublicationData, TalkData } from './model';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_DASH = '–';

/** `2026` → "2026", `2026-09` → "Sep 2026", `2026-09-03` → "3 Sep 2026" (or "Sep 2026" with `'month'`). */
export function formatFlexDate(value: string, precision: 'full' | 'month' = 'full'): string {
  const { year, month, day } = parseFlexDate(value);
  if (month === undefined) return String(year);
  const monthName = MONTHS[month - 1];
  if (day === undefined || precision === 'month') return `${monthName} ${year}`;
  return `${day} ${monthName} ${year}`;
}

/** "Jan 2024 – Present", "Jan 2024 – Jun 2025", or "2024" when both ends render the same. */
export function formatDateRange(
  start: string | undefined,
  end: string | null | undefined,
  options: { present?: string } = {},
): string {
  const present = options.present ?? 'Present';
  if (!start) return end ? formatFlexDate(end, 'month') : '';
  const startText = formatFlexDate(start, 'month');
  if (end === null) return `${startText} ${EN_DASH} ${present}`;
  if (end === undefined) return startText;
  const endText = formatFlexDate(end, 'month');
  return startText === endText ? startText : `${startText} ${EN_DASH} ${endText}`;
}

/** "03 Sep" — the day column of the news timeline; just "May" when only the month is known. */
export function formatDayMonth(value: string): string {
  const { month = 1, day } = parseFlexDate(value);
  const monthName = MONTHS[month - 1];
  return day === undefined ? monthName : `${String(day).padStart(2, '0')} ${monthName}`;
}

/** "Sep 2026" — the compact "Latest" list on the home page. */
export function formatMonthYear(value: string): string {
  return formatFlexDate(value, 'month');
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
}

export interface AuthorPart {
  name: string;
  isSelf: boolean;
}

/** Marks which author strings are the site owner so they can be emphasized. */
export function splitAuthors(authors: readonly string[], nameVariants: readonly string[]): AuthorPart[] {
  const self = new Set(nameVariants.map(normalizeName));
  return authors.map((name) => ({ name, isSelf: self.has(normalizeName(name)) }));
}

/** True for absolute URLs with a scheme (https:, mailto:, …); false for root-relative paths and fragments. */
export function isExternalUrl(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

export const PROJECT_STATUS_LABELS: Record<ProjectData['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
  archived: 'Archived',
};

export const PROJECT_TYPE_LABELS: Record<ProjectData['types'][number], string> = {
  research: 'Research',
  software: 'Software',
  simulation: 'Simulation',
  engineering: 'Engineering',
  teaching: 'Teaching',
};

export const PUBLICATION_STATUS_LABELS: Record<PublicationData['status'], string> = {
  published: 'Published',
  'in-press': 'In press',
  accepted: 'Accepted',
  submitted: 'Submitted',
  preprint: 'Preprint',
  'in-preparation': 'In preparation',
};

export const NEWS_TYPE_LABELS: Record<NewsData['type'], string> = {
  publication: 'Publication',
  talk: 'Talk',
  award: 'Award',
  project: 'Project',
  software: 'Software',
  conference: 'Conference',
  media: 'Media',
  milestone: 'Milestone',
  other: 'Update',
};

export const TALK_TYPE_LABELS: Record<TalkData['type'], string> = {
  invited: 'Invited talk',
  conference: 'Conference talk',
  seminar: 'Seminar',
  poster: 'Poster',
  workshop: 'Workshop',
  panel: 'Panel',
  other: 'Talk',
};

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceData['type'], string> = {
  research: 'Research experience',
  professional: 'Professional experience',
  teaching: 'Teaching',
  service: 'Service',
};
