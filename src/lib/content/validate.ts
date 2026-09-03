import { compareFlexDates } from './dates';
import { COLLECTION_NAMES, type CollectionName, type SiteContent } from './model';
import { ID_RE } from './schemas';

export interface ValidationIssue {
  collection: CollectionName;
  id: string;
  message: string;
}

function knownIds(ids: Set<string>): string {
  const list = [...ids].sort();
  return list.length > 0 ? list.join(', ') : '(none)';
}

/**
 * Cross-collection rules that Zod cannot express: ids, referential integrity,
 * ordering fields, and date ranges. Returns every problem found, in a stable order.
 */
export function validateContent(content: SiteContent): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = {} as Record<CollectionName, Set<string>>;

  for (const name of COLLECTION_NAMES) {
    const seen = new Set<string>();
    for (const entry of content[name]) {
      if (seen.has(entry.id)) {
        issues.push({ collection: name, id: entry.id, message: `duplicate id "${entry.id}"` });
      } else if (!ID_RE.test(entry.id)) {
        issues.push({
          collection: name,
          id: entry.id,
          message: `id "${entry.id}" must be lowercase words joined by single hyphens — rename the file`,
        });
      }
      seen.add(entry.id);
    }
    ids[name] = seen;
  }

  const checkRefs = (
    collection: CollectionName,
    id: string,
    field: string,
    target: CollectionName,
    refs: readonly string[],
  ) => {
    for (const ref of refs) {
      if (!ids[target].has(ref)) {
        issues.push({
          collection,
          id,
          message: `${field} references unknown ${target} id "${ref}" (known: ${knownIds(ids[target])})`,
        });
      }
    }
  };

  const checkRange = (
    collection: CollectionName,
    id: string,
    start: string | undefined,
    end: string | null | undefined,
  ) => {
    if (start && end && compareFlexDates(end, start) < 0) {
      issues.push({ collection, id, message: `end_date ${end} is before start_date ${start}` });
    }
  };

  const checkUniqueOrder = (
    collection: CollectionName,
    field: string,
    entries: { id: string; order: number | undefined }[],
  ) => {
    const owners = new Map<number, string[]>();
    for (const entry of entries) {
      if (entry.order === undefined) continue;
      owners.set(entry.order, [...(owners.get(entry.order) ?? []), entry.id]);
    }
    for (const entry of entries) {
      if (entry.order === undefined) continue;
      const others = (owners.get(entry.order) ?? []).filter((id) => id !== entry.id);
      if (others.length > 0) {
        issues.push({ collection, id: entry.id, message: `${field} ${entry.order} is also used by ${others.join(', ')}` });
      }
    }
  };

  for (const entry of content.projects) {
    checkRefs('projects', entry.id, 'related_project_ids', 'projects', entry.data.related_project_ids);
    if (entry.data.related_project_ids.includes(entry.id)) {
      issues.push({ collection: 'projects', id: entry.id, message: 'related_project_ids must not include the project itself' });
    }
    if (entry.data.featured && entry.data.home_order === undefined) {
      issues.push({ collection: 'projects', id: entry.id, message: 'featured projects need a home_order' });
    }
    checkRange('projects', entry.id, entry.data.start_date, entry.data.end_date);
  }
  checkUniqueOrder(
    'projects',
    'home_order',
    content.projects.filter((entry) => entry.data.featured).map((entry) => ({ id: entry.id, order: entry.data.home_order })),
  );

  for (const entry of content.publications) {
    checkRefs('publications', entry.id, 'project_ids', 'projects', entry.data.project_ids);
    if (entry.data.featured && entry.data.home_order === undefined) {
      issues.push({ collection: 'publications', id: entry.id, message: 'featured publications need a home_order' });
    }
  }
  checkUniqueOrder(
    'publications',
    'home_order',
    content.publications
      .filter((entry) => entry.data.featured)
      .map((entry) => ({ id: entry.id, order: entry.data.home_order })),
  );

  for (const entry of content.news) {
    checkRefs('news', entry.id, 'project_ids', 'projects', entry.data.project_ids);
    checkRefs('news', entry.id, 'publication_ids', 'publications', entry.data.publication_ids);
    checkRefs('news', entry.id, 'talk_ids', 'talks', entry.data.talk_ids);
    checkRefs('news', entry.id, 'award_ids', 'awards', entry.data.award_ids);
  }

  for (const entry of content.talks) {
    checkRefs('talks', entry.id, 'project_ids', 'projects', entry.data.project_ids);
  }

  for (const entry of content.awards) {
    checkRefs('awards', entry.id, 'project_ids', 'projects', entry.data.project_ids);
  }

  for (const entry of content.experiences) {
    checkRefs('experiences', entry.id, 'project_ids', 'projects', entry.data.project_ids);
    checkRange('experiences', entry.id, entry.data.start_date, entry.data.end_date);
  }
  checkUniqueOrder(
    'experiences',
    'cv_order',
    content.experiences.map((entry) => ({ id: entry.id, order: entry.data.cv_order })),
  );

  for (const entry of content.education) {
    checkRange('education', entry.id, entry.data.start_date, entry.data.end_date);
  }
  checkUniqueOrder(
    'education',
    'cv_order',
    content.education.map((entry) => ({ id: entry.id, order: entry.data.cv_order })),
  );

  checkUniqueOrder(
    'skills',
    'order',
    content.skills.map((entry) => ({ id: entry.id, order: entry.data.order })),
  );

  return issues;
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => `- ${issue.collection}/${issue.id}: ${issue.message}`).join('\n');
}

/** Throws a single, actionable error so `astro build` stops on the first broken content set. */
export function assertValidContent(content: SiteContent): void {
  const issues = validateContent(content);
  if (issues.length === 0) return;
  const count = `${issues.length} issue${issues.length === 1 ? '' : 's'}`;
  throw new Error(
    `Site content failed validation (${count}):\n${formatIssues(issues)}\nFix the records under src/content/ and rebuild.`,
  );
}
