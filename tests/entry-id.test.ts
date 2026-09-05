import { describe, expect, it } from 'vitest';
import { entryId, projectTranslationId } from '../src/lib/content/entry-id';

describe('entryId', () => {
  it('uses the file name for a flat record', () => {
    expect(entryId({ entry: 'nysp2i-competition-2026.yaml' })).toBe('nysp2i-competition-2026');
    expect(entryId({ entry: '2026-09-03-a-milestone.yaml' })).toBe('2026-09-03-a-milestone');
  });

  it('uses the folder name for an index file', () => {
    expect(entryId({ entry: 'energyatlas/index.md' })).toBe('energyatlas');
    expect(entryId({ entry: 'nested/energyatlas/index.md' })).toBe('energyatlas');
  });

  it('keeps a non-index file name inside a folder', () => {
    expect(entryId({ entry: 'group/inverse-calibration.md' })).toBe('inverse-calibration');
  });

  it('tolerates Windows separators and a bare index file', () => {
    expect(entryId({ entry: 'energyatlas\\index.md' })).toBe('energyatlas');
    expect(entryId({ entry: 'index.md' })).toBe('index');
  });

  it('ignores the record contents, so an incomplete file still gets an id', () => {
    expect(entryId({ entry: 'draft.yaml', data: undefined })).toBe('draft');
    expect(entryId({ entry: 'draft.yaml', data: { slug: 'ignored' } })).toBe('draft');
  });
});

describe('projectTranslationId', () => {
  it('uses the project folder name for an index.zh.md body', () => {
    expect(projectTranslationId({ entry: 'energyatlas/index.zh.md' })).toBe('energyatlas');
    expect(projectTranslationId({ entry: 'nested/energyatlas/index.zh.md' })).toBe('energyatlas');
    expect(projectTranslationId({ entry: 'energyatlas\\index.zh.md' })).toBe('energyatlas');
  });

  it('does not silently accept another file convention', () => {
    expect(() => projectTranslationId({ entry: 'energyatlas/index.md' })).toThrow('index.zh.md');
    expect(() => projectTranslationId({ entry: 'translation.zh.md' })).toThrow('project folder');
  });
});
