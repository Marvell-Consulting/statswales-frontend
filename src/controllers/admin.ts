import { Request, Response, NextFunction } from 'express';
import { uniqBy } from 'lodash';
import { FieldValidationError } from 'express-validator';

import { logger } from '../utils/logger';
import { ResultsetWithCount } from '../interfaces/resultset-with-count';
import { UserGroupDTO } from '../dtos/user/user-group';
import { ViewError } from '../dtos/view-error';
import { getErrors, hasError } from '../validators';
import {
  nameCyValidator,
  nameEnValidator,
  userGroupIdValidator,
  organisationIdValidator,
  emailCyValidator,
  emailEnValidator,
  emailValidator,
  userIdValidator
} from '../validators/admin';
import { ApiException } from '../exceptions/api.exception';
import { OrganisationDTO } from '../dtos/organisation';
import { Locale } from '../enums/locale';
import { UserGroupMetadataDTO } from '../dtos/user/user-group-metadata-dto';
import { NotFoundException } from '../exceptions/not-found.exception';
import { UserGroupListItemDTO } from '../dtos/user/user-group-list-item-dto';
import { singleLangUserGroup } from '../utils/single-lang-user-group';
import { UserDTO } from '../dtos/user/user';
import { UserCreateDTO } from '../dtos/user/user-create-dto';
import { UserRole } from '../enums/user-role';

export const fetchUserGroup = async (req: Request, res: Response, next: NextFunction) => {
  const userGroupIdError = await hasError(userGroupIdValidator(), req);

  if (userGroupIdError) {
    logger.error('Invalid or missing userGroupId');
    next(new NotFoundException('errors.user_group_missing'));
    return;
  }

  try {
    const group = await req.pubapi.getUserGroup(req.params.userGroupId);
    res.locals.groupId = group.id;
    res.locals.group = group;
  } catch (err: any) {
    if (err.status === 401) {
      next(err);
      return;
    }
    next(new NotFoundException('errors.user_group_missing'));
    return;
  }

  next();
};

export const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
  const userIdError = await hasError(userIdValidator(), req);

  if (userIdError) {
    logger.error('Invalid or missing userId');
    next(new NotFoundException('errors.user_missing'));
    return;
  }

  try {
    const user = await req.pubapi.getUser(req.params.userId);
    res.locals.userId = user.id;
    res.locals.user = user;
  } catch (err: any) {
    if (err.status === 401) {
      next(err);
      return;
    }
    next(new NotFoundException('errors.user_missing'));
    return;
  }

  next();
};

export const viewGroup = async (req: Request, res: Response) => {
  const group = singleLangUserGroup(res.locals.group, req.language);
  res.render('admin/user-group-view', { group });
};

export const listUserGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const { data }: ResultsetWithCount<UserGroupListItemDTO> = await req.pubapi.listUserGroups(page, limit);
    res.render('admin/user-group-list', { groups: data });
  } catch (err) {
    next(err);
  }
};

export const provideGroupName = async (req: Request, res: Response) => {
  let group: UserGroupDTO = res.locals.group;
  const isRevisit = Boolean(group);
  let errors: ViewError[] = [];
  let values = {
    name_en: group?.metadata?.find((m) => m.language === Locale.EnglishGb)?.name || '',
    name_cy: group?.metadata?.find((m) => m.language === Locale.WelshGb)?.name || ''
  };

  try {
    if (req.method === 'POST') {
      values = req.body;
      const validators = [nameCyValidator(), nameEnValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `admin.group.name.form.${error.path}.error.${error.msg}` } };
      });

      errors = uniqBy(errors, 'field');
      if (errors.length > 0) throw errors;

      const metadata: UserGroupMetadataDTO[] = [
        { name: values.name_en, language: Locale.EnglishGb },
        { name: values.name_cy, language: Locale.WelshGb }
      ];

      if (group) {
        await req.pubapi.updateUserGroup({ id: group.id, metadata });
        res.redirect(`/admin/group/${group.id}/organisation`);
      } else {
        group = await req.pubapi.createUserGroup(metadata);
        res.redirect(`/admin/group/${group.id}/organisation`);
      }
      return;
    }
  } catch (err) {
    logger.error(err, 'there was a problem saving the user group');
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'admin.group.name.error.saving' } }];
    }
  }

  res.render('admin/user-group-name', { isRevisit, values, errors });
};

export const provideOrganisation = async (req: Request, res: Response) => {
  const group: UserGroupDTO = res.locals.group;
  let organisations: OrganisationDTO[] = [];
  let errors: ViewError[] = [];
  let values = { organisation_id: group.organisation_id || '' };

  try {
    organisations = await req.pubapi.getAllOrganisations();

    if (req.method === 'POST') {
      values = req.body;
      const validators = [organisationIdValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `admin.group.organisation.form.${error.path}.error` } };
      });

      errors = uniqBy(errors, 'field');
      if (errors.length > 0) throw errors;

      await req.pubapi.updateUserGroup({ id: group.id, organisation_id: values.organisation_id });
      res.redirect(req.buildUrl(`/admin/group/${group.id}/email`, req.language));
      return;
    }
  } catch (err) {
    logger.error(err, 'there was a problem saving the user group org');
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'admin.group.organisation.error.saving' } }];
    }
  }

  res.render('admin/user-group-org', { values, organisations, errors });
};

export const provideGroupEmail = async (req: Request, res: Response) => {
  const group: UserGroupDTO = res.locals.group;
  let errors: ViewError[] = [];
  let values = {
    email_en: group?.metadata?.find((m) => m.language === Locale.EnglishGb)?.email || '',
    email_cy: group?.metadata?.find((m) => m.language === Locale.WelshGb)?.email || ''
  };

  try {
    if (req.method === 'POST') {
      values = req.body;
      const validators = [emailCyValidator(), emailEnValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `admin.group.email.form.${error.path}.error.${error.msg}` } };
      });

      errors = uniqBy(errors, 'field');
      if (errors.length > 0) throw errors;

      const metadata: UserGroupMetadataDTO[] = [
        { email: values.email_en, language: Locale.EnglishGb },
        { email: values.email_cy, language: Locale.WelshGb }
      ];

      await req.pubapi.updateUserGroup({ id: group.id, metadata });
      req.session.flash = ['admin.group.email.success'];
      req.session.save();
      res.redirect(`/admin/group`);
      return;
    }
  } catch (err) {
    logger.error(err, 'there was a problem saving the user group');
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'admin.group.email.error.saving' } }];
    }
  }

  res.render('admin/user-group-email', { values, errors });
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const { data }: ResultsetWithCount<UserDTO> = await req.pubapi.listUsers(page, limit);
    res.render('admin/user-list', { users: data });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response) => {
  let errors: ViewError[] = [];
  let values: UserCreateDTO = { email: '' };

  try {
    if (req.method === 'POST') {
      values = req.body;
      const validators = [emailValidator()];

      errors = (await getErrors(validators, req)).map((error: FieldValidationError) => {
        return { field: error.path, message: { key: `admin.user.create.form.${error.path}.error.${error.msg}` } };
      });

      errors = uniqBy(errors, 'field');
      if (errors.length > 0) throw errors;

      await req.pubapi.createUser(values);
      req.session.flash = ['admin.user.create.success'];
      req.session.save();
      res.redirect(`/admin/user`);
      return;
    }
  } catch (err) {
    logger.error(err, 'there was a problem creating the user');
    if (err instanceof ApiException) {
      const error = JSON.parse(err.body as string).error;
      if (err.status === 400 && error.includes('user_already_exists')) {
        errors = [{ field: 'email', message: { key: 'admin.user.create.error.email_already_exists' } }];
      } else {
        errors = [{ field: 'api', message: { key: 'admin.user.create.error.saving' } }];
      }
    }
  }

  res.render('admin/user-create', { values, errors });
};

export const viewUser = async (req: Request, res: Response) => {
  const user: UserDTO = res.locals.user;
  res.render('admin/user-view', { user });
};

export const editUserRoles = async (req: Request, res: Response) => {
  const user: UserDTO = res.locals.user;
  let errors: ViewError[] = [];
  let availableRoles: UserRole[] = [];

  try {
    availableRoles = await req.pubapi.getAvailableRoles();

    if (req.method === 'POST') {
      //todo
    }
  } catch (err) {
    if (err instanceof ApiException) {
      errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
    }
  }

  res.render('admin/user-roles', { user, availableRoles, errors });
};
