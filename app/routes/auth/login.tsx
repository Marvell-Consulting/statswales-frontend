import { appConfig } from '~/config';
import { data } from 'react-router';
import { LocaleLink } from '~/components/LocaleLink';
import type { Route } from './+types/login';
import { publisherApi } from '~/middleware/publisher-api.server';
import ErrorHandler from '~/components/ErrorHandler';
import T from '~/components/T';
import { logger } from '~/utils/logger.server';

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  let providers;
  const api = context.get(publisherApi);
  const config = appConfig();

  const error = new URL(request.url).searchParams.get('error');
  let errors: string[] = [];

  try {
    providers = await api.getEnabledAuthProviders();
  } catch (err) {
    logger.error(err, 'Could not fetch auth providers from backend');
    providers = config.auth.providers;
  }

  if (error) {
    errors = error === 'expired' ? ['login.error.expired'] : [error];
    logger.error(`Authentication token has expired`);
    errors = ['login.error.expired'];
    return data({ providers, errors }, { status: 400 });
  }

  return {
    providers,
    errors
  };
};

export default function Auth({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1 className="govuk-heading-xl">
        <T>login.heading</T>
      </h1>

      <ErrorHandler />

      <div className="govuk-button-group">
        {loaderData.providers.map((provider, index) => (
          <LocaleLink key={index} path={`/auth/${provider}`} className="govuk-button">
            <T>login.buttons.{provider}</T>
          </LocaleLink>
        ))}
      </div>
    </>
  );
}
