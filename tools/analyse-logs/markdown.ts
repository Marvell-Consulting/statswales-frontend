export function heading(level: number, text: string): string {
  return `${'#'.repeat(level)} ${text}\n`;
}

function escapeCell(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|');
}

export function table(headers: string[], rows: (string | number)[][]): string {
  if (rows.length === 0) return '_No data._\n';
  const sep = headers.map(() => '---');
  const lines = [
    `| ${headers.map((h) => escapeCell(h)).join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...rows.map((row) => `| ${row.map((c) => escapeCell(c)).join(' | ')} |`)
  ];
  return lines.join('\n') + '\n';
}

export function codeBlock(content: string, lang = ''): string {
  return `\`\`\`${lang}\n${content}\n\`\`\`\n`;
}

export function bold(text: string): string {
  return `**${text}**`;
}
