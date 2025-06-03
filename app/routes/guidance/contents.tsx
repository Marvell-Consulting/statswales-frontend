import { getLocale } from '~/middleware/i18next.server';
import T from '~/components/T';
import type { Route } from './+types/contents';
import { getContents } from '~/utils/gather-docs.server';
import { LocaleLink } from '~/components/LocaleLink';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const contents = await getContents(locale, 'guidance');

  return { contents };
};

export default function Guidance({ loaderData }: Route.ComponentProps) {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">
          <T>guidance.title</T>
        </h1>
        <ul className="govuk-list govuk-list--bullet">
          {loaderData.contents.map(({ title, filename }, index) => (
            <li key={index}>
              <LocaleLink path={`/guidance/${filename}`}>{title}</LocaleLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
