import { getLocale } from '~/middleware/i18next.server';
import type { Route } from './+types/cookies';
import { createToc, getDoc } from '~/utils/gather-docs.server';
import { MarkdownDocument } from '~/components/MarkdownDocument';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const doc = await getDoc('cookie-statement', 'cookies', locale);
  const toc = createToc(doc);
  return { doc, toc };
};

export default function Cookies({ loaderData }: Route.ComponentProps) {
  return <MarkdownDocument toc={loaderData.toc} doc={loaderData.doc} />;
}
