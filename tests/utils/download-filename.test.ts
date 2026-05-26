import { SingleLanguageRevision } from '../../src/shared/dtos/single-language/revision';
import { getDownloadFilename } from '../../src/shared/utils/download-filename';

const baseRevision = (overrides: Partial<SingleLanguageRevision> = {}): SingleLanguageRevision =>
  ({
    id: 'rev-1',
    revision_index: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: 'user-1',
    metadata: { title: 'Welsh Health Stats' },
    ...overrides
  }) as SingleLanguageRevision;

describe('getDownloadFilename', () => {
  it('uses v<index> format for published revisions (revision_index > 0)', () => {
    const filename = getDownloadFilename('dataset-id', baseRevision({ revision_index: 3 }), 'en-GB');
    expect(filename).toBe('Welsh Health Stats-v3-en-GB');
  });

  it('labels the initial revision as v1 (per domain rule: initial revision_index = 1)', () => {
    const filename = getDownloadFilename('dataset-id', baseRevision({ revision_index: 1 }), 'en-GB');
    expect(filename).toBe('Welsh Health Stats-v1-en-GB');
  });

  it('labels draft revisions (revision_index = 0) as "draft"', () => {
    const filename = getDownloadFilename('dataset-id', baseRevision({ revision_index: 0 }), 'en-GB');
    expect(filename).toBe('Welsh Health Stats-draft-en-GB');
  });

  it('includes the language code verbatim', () => {
    const filename = getDownloadFilename('dataset-id', baseRevision({ revision_index: 2 }), 'cy-GB');
    expect(filename).toBe('Welsh Health Stats-v2-cy-GB');
  });

  it('falls back to the dataset id when metadata is undefined', () => {
    const filename = getDownloadFilename('abc-123', baseRevision({ revision_index: 1, metadata: undefined }), 'en-GB');
    expect(filename).toBe('abc-123-v1-en-GB');
  });

  it('falls back to the dataset id when metadata.title is undefined', () => {
    const filename = getDownloadFilename(
      'abc-123',
      baseRevision({ revision_index: 1, metadata: { title: undefined } as never }),
      'en-GB'
    );
    expect(filename).toBe('abc-123-v1-en-GB');
  });

  it('returns the title verbatim — sanitisation is handled downstream by getDownloadHeaders/slugify', () => {
    // The function intentionally does not sanitise; it just composes the name.
    // Downstream `getDownloadHeaders` runs slugify on the result.
    const filename = getDownloadFilename(
      'dataset-id',
      baseRevision({ revision_index: 1, metadata: { title: 'Q1 2026 / Q2 2026' } as never }),
      'en-GB'
    );
    expect(filename).toBe('Q1 2026 / Q2 2026-v1-en-GB');
  });
});
