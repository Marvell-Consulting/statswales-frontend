import { markdownToSafeHTML } from '../../src/shared/utils/markdown-to-html';

describe('markdownToSafeHTML', () => {
  it('renders legitimate markdown to HTML', async () => {
    const result = await markdownToSafeHTML('# Heading\n\nSome **bold** text and a [link](https://example.com).');
    expect(result).toMatch(/<h1\b[^>]*>Heading<\/h1>/);
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toMatch(/<a\b[^>]*href="https:\/\/example\.com"[^>]*>link<\/a>/);
  });

  it('strips <script> tags injected via raw HTML in markdown', async () => {
    const result = await markdownToSafeHTML('Hello <script>alert("xss")</script> world');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert(');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });

  it('strips inline event handler attributes', async () => {
    const result = await markdownToSafeHTML('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('strips javascript: URIs from links', async () => {
    const result = await markdownToSafeHTML('[click me](javascript:alert(1))');
    expect(result).not.toContain('javascript:');
  });

  it('handles undefined content', async () => {
    const result = await markdownToSafeHTML(undefined);
    expect(result).toBe('');
  });
});
