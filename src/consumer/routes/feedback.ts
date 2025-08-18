import { Router, Request, Response } from 'express';
import { FieldValidationError } from 'express-validator';
import { NotifyClient } from 'notifications-node-client';

import { i18next } from '../../shared/middleware/translation';
import { flashMessages } from '../../shared/middleware/flash';
import { ViewError } from '../../shared/dtos/view-error';
import { getErrors, improveValidator, satisfactionValidator } from '../../shared/validators';
import { appConfig } from '../../shared/config';
import { logger } from '../../shared/utils/logger';
import { AppEnv } from '../../shared/config/env.enum';

const config = appConfig();

export const feedback = Router();

feedback.use(flashMessages);

const feedbackForm = async (req: Request, res: Response) => {
  const title = i18next.t('feedback.heading', { lng: req.language });
  let errors: ViewError[] = [];
  let values: Record<string, any> = {};

  if (req.method === 'POST') {
    const validators = [satisfactionValidator(), improveValidator()];
    const { satisfaction, improve } = req.body;
    values = { satisfaction, improve };

    errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
      return { field: error.path, message: { key: `feedback.form.${error.path}.error` } };
    });

    if (errors.length === 0) {
      // don't send emails to notify in CI
      if (config.env !== AppEnv.Ci) {
        const supportEmail = req.language.includes('en') ? config.email.support.en : config.email.support.cy;
        const notifyClient = new NotifyClient(config.email.notify.apikey);
        const notifyTemplateId = '';

        await notifyClient
          .sendEmail(notifyTemplateId, supportEmail, {
            personalisation: {
              satisfaction: values.satisfaction,
              improve: values.improve
            },
            reference: 'statswales-feedback-form'
          })
          .catch((err) => {
            logger.error(err, 'There was a problem sending the feedback form to support address');
            // not really much we can do here other than log the failure
          });
      }

      req.session.flash = [`feedback.form.success`];
      req.session.save();
      res.redirect(req.buildUrl('/feedback', req.language));
      return;
    }
  }

  res.render('feedback', { title, values, errors });
};

feedback.get('/', feedbackForm);
feedback.post('/', feedbackForm);
