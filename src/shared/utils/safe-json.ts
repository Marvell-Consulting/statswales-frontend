// Embed data as JSON inside a <script> (either as a JSON data block or as a JS literal) without letting a stray
// "</script>" or "<!--" in the value break out of the element. Both JSON.parse and JS read < as "<".
export const safeJson = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
