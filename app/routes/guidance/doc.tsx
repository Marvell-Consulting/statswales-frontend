import type { Route } from './+types/doc';
import { getLocale } from '~/middleware/i18next.server';
import { createToc, getDoc } from '~/utils/gather-docs.server';
import { MarkdownDocument } from '~/components/MarkdownDocument';

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const doc = await getDoc(params.doc, 'guidance', locale);
  const toc = createToc(doc);
  return { doc, toc };
};

export default function Doc({ loaderData }: Route.ComponentProps) {
  return <MarkdownDocument toc={loaderData.toc} doc={loaderData.doc} />;
}
