/** Check the stable document anchors that power paper citations and cross-references. */
export function findFragmentIssues(html: string): string[] {
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]);
  const unique = new Set(ids);
  const issues = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))].map(id => `duplicate id ${id}`);
  for (const match of html.matchAll(/\shref=["']#([^"']+)["']/g)) {
    let id: string;
    try { id = decodeURIComponent(match[1]); } catch { issues.push(`invalid fragment #${match[1]}`); continue; }
    if (!unique.has(id)) issues.push(`missing fragment #${id}`);
  }
  return [...new Set(issues)];
}
