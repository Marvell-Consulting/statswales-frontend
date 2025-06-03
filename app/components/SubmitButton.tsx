import { useTranslation } from 'react-i18next';

export const SubmitButton = () => {
  const { t } = useTranslation();
  return (
    <button type="submit" className="govuk-button" data-module="govuk-button">
      {t('buttons.continue')}
    </button>
  );
};
