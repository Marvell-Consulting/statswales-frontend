import { Request, Response, NextFunction } from 'express';
import { uniqBy } from 'lodash';

import { logger } from '../utils/logger';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { UserGroupDTO } from '../dtos/user/user-group';
import { ViewError } from '../dtos/view-error';
import { getErrors } from '../validators';
import { FieldValidationError } from 'express-validator';
import { nameCyValidator, nameEnValidator, organisationIdValidator } from '../validators/admin';
import { ApiException } from '../exceptions/api.exception';
import { OrganisationDTO } from '../dtos/organisation';

export const listUserGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const { data }: ResultsetWithCount<UserGroupDTO> = await req.pubapi.getUserGroups(page, limit);
    res.render('admin/user-group-list', { groups: data });
  } catch (err) {
    next(err);
  }
};

export const provideGroupName = async (req: Request, res: Response) => {
  let errors: ViewError[] = [];
  let values = { name_en: '', name_cy: '' };

  try {
    if (req.method === 'POST') {
      values = req.body;
      const validators = [nameCyValidator(), nameEnValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `admin.group.name.form.${error.path}.error.${error.msg}` } };
      });

      errors = uniqBy(errors, 'field');
      if (errors.length > 0) throw errors;

      const group = await req.pubapi.createUserGroup(values);
      res.redirect(`/admin/group/${group.id}/organisation`);
    }
  } catch (err) {
    logger.error(err, 'there was a problem saving the user group');
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'admin.user_group.name.error.saving' } }];
    }
  }

  res.render('admin/user-group-name', { values, errors });
};

export const provideOrganisation = async (req: Request, res: Response) => {
  let organisations: OrganisationDTO[] = [];
  let errors: ViewError[] = [];
  let values = { organisation_id: '' };
  let group: UserGroupDTO;

  try {
    group = await req.pubapi.getUserGroup(req.params.groupId);
    organisations = await req.pubapi.getAllOrganisations();

    if (req.method === 'POST') {
      values = req.body;
      const validators = [organisationIdValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `admin.group.organisation.form.${error.path}.error` } };
      });

      errors = uniqBy(errors, 'field');
      if (errors.length > 0) throw errors;

      await req.pubapi.updateUserGroup(group.id!, values);
      res.redirect(req.buildUrl(`/admin/group/${group.id}/email`, req.language));
      return;
    }
  } catch (err) {
    logger.error(err, 'there was a problem saving the user group org');
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'admin.user_group.organisation.error.saving' } }];
    }
  }

  res.render('admin/user-group-org', { values, organisations, errors });
};

export const provideEmail = async (req: Request, res: Response) => {
  let errors: ViewError[] = [];
  let values = { email_en: '', email_cy: '' };
  res.render('admin/user-group-email', { values, errors });
};
