/**
 * The id of every record is its file name — or its folder name for `<slug>/index.md`.
 *
 * Astro's default generator reads a `slug` field out of the parsed record, which means a half-written or
 * empty file crashes the content sync with a stack trace inside node_modules, and a stray `slug:` field
 * could silently rename a record. Deriving the id from the path alone avoids both: an incomplete file
 * still gets an id and then fails schema validation with a message that names the file.
 */
export interface EntryIdOptions {
  /** Path of the entry file, relative to the collection's base directory. */
  entry: string;
  /** Parsed record, deliberately unused. */
  data?: unknown;
}

export function entryId({ entry }: EntryIdOptions): string {
  const withoutExtension = entry.replace(/\.[^./\\]+$/, '');
  const parts = withoutExtension.split(/[/\\]/).filter(Boolean);
  const last = parts.at(-1) ?? withoutExtension;
  return last === 'index' && parts.length > 1 ? parts[parts.length - 2] : last;
}

/** Project id for the optional `<project>/index.zh.md` body collection. */
export function projectTranslationId({ entry }: EntryIdOptions): string {
  const parts = entry.split(/[/\\]/).filter(Boolean);
  if (parts.length < 2) throw new Error(`A project translation must live inside its project folder: ${entry}`);
  if (parts.at(-1) !== 'index.zh.md') throw new Error(`Expected a project translation named index.zh.md, received ${entry}`);
  return parts[parts.length - 2];
}
