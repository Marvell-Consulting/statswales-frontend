import { useTranslation } from 'react-i18next';

export const PhaseBanner = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="govuk-phase-banner">
      <div className="govuk-width-container">
        <p className="govuk-phase-banner__content">
          <strong className="govuk-tag govuk-phase-banner__content__tag">
            {t('consumer.global.phase_banner.beta')}
          </strong>
          <span
            className="govuk-phase-banner__text"
            dangerouslySetInnerHTML={{
              __html: t('consumer.global.phase_banner.feedback', {
                feedback_url: `/${i18n.language}/${t('routes.feedback')}`
              })
            }}
          ></span>
        </p>
      </div>
    </div>
  );
};
