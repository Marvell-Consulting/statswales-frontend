import { Router, Request, Response } from 'express';
import { FieldValidationError } from 'express-validator';
import { NotifyClient } from 'notifications-node-client';

import { i18next } from '../middleware/translation';
import { ViewError } from '../dtos/view-error';
import { getErrors, improveValidator, satisfactionValidator } from '../validators';
import { appConfig } from '../config';
import { flashMessages } from '../middleware/flash';
import { logger } from '../utils/logger';

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
