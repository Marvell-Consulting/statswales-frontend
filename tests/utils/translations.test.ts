import { markdownToHtml } from '../../src/shared/utils/translations';
import { TranslationDTO } from '../../src/shared/dtos/translations';

const XSS_PAYLOAD = '<img src=x onerror=alert(1)>';

describe('markdownToHtml', () => {
  it('sanitizes metadata rows (existing behaviour)', async () => {
    const rows: TranslationDTO[] = [{ type: 'metadata', key: 'description', english: XSS_PAYLOAD, cymraeg: 'ok' }];

    const [result] = await markdownToHtml(rows);

    // DOMPurify keeps the harmless <img> tag but strips the dangerous event handler
    expect(result.english).not.toContain('onerror');
  });

  it.each(['dimension', 'measure', 'link', 'anything-attacker-controlled'])(
    'sanitizes rows of type "%s" too, since `type` comes straight from the uploaded CSV',
    async (type) => {
      const rows: TranslationDTO[] = [{ type, key: 'name', english: XSS_PAYLOAD, cymraeg: XSS_PAYLOAD }];

      const [result] = await markdownToHtml(rows);

      expect(result.english).not.toContain('onerror');
      expect(result.cymraeg).not.toContain('onerror');
    }
  );

  it('neutralizes a <script> payload regardless of row type', async () => {
    const rows: TranslationDTO[] = [
      { type: 'link', key: 'related', english: '<script>alert(document.cookie)</script>', cymraeg: 'ok' }
    ];

    const [result] = await markdownToHtml(rows);

    expect(result.english).not.toContain('<script>');
  });

  it('still returns plain text content untouched for benign values', async () => {
    const rows: TranslationDTO[] = [{ type: 'dimension', key: 'name', english: 'Area', cymraeg: 'Ardal' }];

    const [result] = await markdownToHtml(rows);

    expect(result.english).toContain('Area');
    expect(result.cymraeg).toContain('Ardal');
  });

  it('handles missing english/cymraeg values without throwing', async () => {
    const rows: TranslationDTO[] = [{ type: 'metadata', key: 'description' }];

    await expect(markdownToHtml(rows)).resolves.toBeDefined();
  });
});
