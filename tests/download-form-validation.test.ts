import { Request, Response, NextFunction } from 'express';

import { downloadPublishedDataset } from '../src/consumer/controllers/consumer';
import { downloadPreview } from '../src/publisher/controllers/publish';
import { localeUrl } from '../src/shared/middleware/language-switcher';
import { downloadFormErrorKey } from '../src/shared/validators';
import { Locale } from '../src/shared/enums/locale';

describe('downloadFormErrorKey', () => {
  test('falls back to the generic "there is a problem" key for a field with no explicit mapping', () => {
    expect(downloadFormErrorKey('some_unmapped_field')).toBe('errors.problem');
  });
});

// the download form used to pre-select a radio in every group, so this validation branch was
// unreachable from a real browser - now the radios start blank (SW-1334), a submission that
// skips one of the required fields can genuinely hit it, so it needs to redisplay the page
// with field errors rather than throw a raw 400
describe('download form validation (radios no longer default to a value)', () => {
  const validSubmission = {
    view_type: 'unfiltered',
    format: 'csv',
    view_choice: 'formatted',
    download_language: 'en-GB'
  };

  describe('consumer downloadPublishedDataset', () => {
    const publishedDataset = {
      id: 'ef417041-37fc-4273-8e8c-227eb4674b29',
      first_published_at: '2024-01-01T00:00:00.000Z',
      published_revision: {
        id: 'rev-1',
        metadata: [{ language: Locale.EnglishGb, title: 'Test dataset' }],
        providers: [],
        related_links: []
      },
      revisions: [],
      dimensions: []
    };

    const mockReq = (body: Record<string, unknown>) =>
      ({
        method: 'POST',
        body,
        language: Locale.EnglishGb,
        session: { save: jest.fn() },
        buildUrl: localeUrl,
        conapi: { generateFilterId: jest.fn().mockResolvedValue('filter-id-123') }
      }) as unknown as Request;

    const mockRes = () => ({ locals: { dataset: publishedDataset }, redirect: jest.fn() }) as unknown as Response;

    test('redirects back to the downloads tab with field errors when required fields are missing', async () => {
      const req = mockReq({});
      const res = mockRes();
      const next = jest.fn();

      await downloadPublishedDataset(req, res, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(req.session.errors).toEqual(
        expect.arrayContaining([
          { field: 'view_type', message: { key: 'consumer_view.downloads.type.errors.missing' } },
          { field: 'format', message: { key: 'consumer_view.downloads.file_type.errors.missing' } },
          { field: 'view_choice', message: { key: 'consumer_view.downloads.number_formatting.errors.missing' } },
          { field: 'download_language', message: { key: 'consumer_view.downloads.language.errors.missing' } }
        ])
      );
      expect(req.session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('#downloads'));
    });

    test('still succeeds when every required field is explicitly chosen', async () => {
      const req = mockReq(validSubmission);
      const res = mockRes();
      const next = jest.fn();

      await downloadPublishedDataset(req, res, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(req.session.errors).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/download/filter-id-123'));
    });

    // `extended` is optional (omitting it is fine, treated as "no"), but an out-of-range value should still map to a
    // real message key, not `undefined` (github.com/Marvell-Consulting/statswales-frontend/pull/689).
    // This protects error rendering/translation when handling tampered POSTs.
    test('gives a real error key for an out-of-range extended value, not an undefined one', async () => {
      const req = mockReq({ ...validSubmission, extended: 'maybe' });
      const res = mockRes();
      const next = jest.fn();

      await downloadPublishedDataset(req, res, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(req.session.errors).toEqual([
        { field: 'extended', message: { key: 'consumer_view.downloads.extended.errors.missing' } }
      ]);
    });
  });

  describe('publisher downloadPreview', () => {
    const mockReq = (body: Record<string, unknown>) =>
      ({
        method: 'POST',
        body,
        language: Locale.EnglishGb,
        session: { save: jest.fn() },
        buildUrl: localeUrl,
        pubapi: { generateFilterId: jest.fn().mockResolvedValue('filter-id-456') }
      }) as unknown as Request;

    const mockRes = () =>
      ({
        locals: { dataset: { id: 'dataset-id', end_revision_id: 'end-rev-id' } },
        redirect: jest.fn()
      }) as unknown as Response;

    test('redirects back to the cube preview downloads tab with field errors when required fields are missing', async () => {
      const req = mockReq({});
      const res = mockRes();
      const next = jest.fn();

      await downloadPreview(req, res, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(req.session.errors).toEqual(
        expect.arrayContaining([
          { field: 'view_type', message: { key: 'consumer_view.downloads.type.errors.missing' } }
        ])
      );
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('cube-preview#downloads'));
    });

    test('still succeeds when every required field is explicitly chosen', async () => {
      const req = mockReq(validSubmission);
      const res = mockRes();
      const next = jest.fn();

      await downloadPreview(req, res, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(req.session.errors).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/download/filter-id-456'));
    });

    test('gives a real error key for an out-of-range extended value, not an undefined one', async () => {
      const req = mockReq({ ...validSubmission, extended: 'maybe' });
      const res = mockRes();
      const next = jest.fn();

      await downloadPreview(req, res, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
      expect(req.session.errors).toEqual([
        { field: 'extended', message: { key: 'consumer_view.downloads.extended.errors.missing' } }
      ]);
    });
  });
});
