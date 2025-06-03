import fs from 'node:fs';
import path from 'node:path';
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,

  async prerender() {
    const base = path.join(import.meta.dirname, './public/docs');
    return fs.readdirSync(base).flatMap((dir) => {
      const langs = fs.readdirSync(path.join(base, dir));
      return langs.flatMap((lang) => {
        const files = fs.readdirSync(path.join(base, dir, lang));
        return files.flatMap((file) => `/${lang}-GB/${dir}/${file.replace(/\.md$/, '')}`);
      });
    });
  },

  future: {
    unstable_middleware: true
  }
} satisfies Config;
