import { Request, Response, NextFunction } from 'express';
import { sortBy, uniqBy } from 'lodash';
import { FieldValidationError } from 'express-validator';

import { logger } from '../../shared/utils/logger';
import { ResultsetWithCount } from '../../shared/interfaces/resultset-with-count';
import { UserGroupDTO } from '../../shared/dtos/user/user-group';
import { ViewError } from '../../shared/dtos/view-error';
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
import { ApiException } from '../../shared/exceptions/api.exception';
import { OrganisationDTO } from '../../shared/dtos/organisation';
import { Locale } from '../../shared/enums/locale';
import { UserGroupMetadataDTO } from '../../shared/dtos/user/user-group-metadata-dto';
import { NotFoundException } from '../../shared/exceptions/not-found.exception';
import { UserGroupListItemDTO } from '../../shared/dtos/user/user-group-list-item-dto';
import { singleLangUserGroup } from '../../shared/utils/single-lang-user-group';
import { UserDTO } from '../../shared/dtos/user/user';
import { UserCreateDTO } from '../../shared/dtos/user/user-create-dto';
import { UserAction } from '../../shared/enums/user-action';
import { SingleLanguageUserGroup } from '../../shared/dtos/single-language/user-group';
import { AvailableRoles } from '../../shared/interfaces/available-roles';
import { Organisation } from '../../shared/interfaces/organisation';
import { groupByOrg } from '../../shared/utils/group-by-org';
import { GroupRole } from '../../shared/enums/group-role';
import { RoleSelectionDTO } from '../../shared/dtos/user/role-selection-dto';
import { getUserRoleFormValues } from '../../shared/utils/user-role-form-values';
import { UserRoleFormValues } from '../../shared/interfaces/user-role-form-values';
import { differenceInSeconds } from 'date-fns';
import { UserStatus } from '../../shared/enums/user-status';
import { pageInfo } from '../../shared/utils/pagination';

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
    if ([401, 403].includes(err.status)) {
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
    const user = await req.pubapi.getUserById(req.params.userId);
    res.locals.userId = user.id;
    res.locals.user = user;
  } catch (err: any) {
    if ([401, 403].includes(err.status)) {
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
  const datsetCount = group.datasets?.length || 0;
  res.render('admin/user-group-view', { group, datsetCount });
};

export const listUserGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page_number as string, 10) || 1;
    const limit = parseInt(req.query.page_size as string, 10) || 10;
    const flash = res.locals.flash;
    const { data, count }: ResultsetWithCount<UserGroupListItemDTO> = await req.pubapi.listUserGroups(page, limit);
    const pagination = pageInfo(page, limit, count);
    res.render('admin/user-group-list', { groups: data, ...pagination, flash });
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

  const action = values.email_en ? 'update' : 'create'; // if email already exists, this is an update

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
      req.session.flash = [`admin.group.email.success.${action}`];
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
    const search = req.query.search as string | undefined;
    const { data, count }: ResultsetWithCount<UserDTO> = await req.pubapi.listUsers(page, limit, search);
    const pagination = pageInfo(page, limit, count);
    res.render('admin/user-list', { users: data, count, search, ...pagination });
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

      const user = await req.pubapi.createUser(values);
      res.redirect(`/admin/user/${user.id}/roles`);
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

  const actions = [
    { key: UserAction.EditRoles, url: req.buildUrl(`/admin/user/${user.id}/roles`, req.language) },
    {
      key: user.status === UserStatus.Active ? UserAction.Deactivate : UserAction.Reactivate,
      url: req.buildUrl(`/admin/user/${user.id}/status`, req.language)
    }
  ];

  const action = req.body?.action || '';
  const flash = res.locals.flash;

  const groups = sortBy(
    user.groups.map((groupRole) => ({
      ...singleLangUserGroup(groupRole.group, req.language),
      roles: groupRole.roles
    })),
    'name'
  );

  res.render('admin/user-view', { user, groups, actions, action, flash });
};

export const editUserRoles = async (req: Request, res: Response) => {
  const user: UserDTO = res.locals.user;
  const userName = user.name || user.email;
  let errors: ViewError[] = [];
  let availableRoles: AvailableRoles = { global: [], group: [] };
  let availableGroups: SingleLanguageUserGroup[] = [];
  let availableOrganisations: Organisation[] = [];
  let values: UserRoleFormValues = getUserRoleFormValues(user);

  // user is already created in the db, but we want the success message to be relevant to the create/update journey
  const action = differenceInSeconds(new Date(), user.created_at) < 60 ? 'create' : 'update';

  try {
    [availableGroups, availableRoles] = await Promise.all([
      req.pubapi.getAllUserGroups().then((groups) => groups.map((group) => singleLangUserGroup(group, req.language))),
      req.pubapi.getAvailableUserRoles()
    ]);

    availableOrganisations = groupByOrg(availableGroups);

    if (req.method === 'POST') {
      const selected: RoleSelectionDTO[] = [];

      values = {
        ...req.body,
        global: Array.isArray(req.body?.global) ? req.body?.global : [req.body?.global],
        groups: Array.isArray(req.body?.groups) ? req.body?.groups : [req.body?.groups]
      };

      if (values.global) {
        selected.push({ type: 'global', roles: values.global.filter(Boolean) });
      }

      values.groups?.filter(Boolean).forEach((groupId: string) => {
        if (!availableGroups.find((group) => group.id === groupId)) {
          errors.push({ field: 'groups', message: { key: 'admin.user.roles.form.groups.error.invalid' } });
          return;
        }

        const roles = (
          Array.isArray(values[`group_roles_${groupId}`])
            ? values[`group_roles_${groupId}`]
            : [values[`group_roles_${groupId}`]]
        ) as GroupRole[];

        if (roles && roles.length > 0) {
          selected.push({ type: 'group', roles, groupId });
        }
      });

      selected
        .filter((selection) => selection.type === 'group')
        .forEach((selection) => {
          const groupName = availableGroups.find((group) => group.id === selection.groupId)?.name;
          const groupRoles = selection.roles.filter(Boolean) as GroupRole[];
          const invalid = groupRoles.some((role: GroupRole) => !availableRoles.group.includes(role));
          const missing = groupRoles.length === 0;
          if (invalid || missing) {
            errors.push({
              field: 'roles',
              message: {
                key: 'admin.user.roles.form.roles.error.invalid',
                params: { userName, groupName }
              }
            });
          }
        });

      if (errors.length > 0) throw errors;

      await req.pubapi.updateUserRoles(user.id, selected);
      req.session.flash = [{ key: `admin.user.roles.success.${action}`, params: { userName } }];
      req.session.save();
      res.redirect(req.buildUrl(`/admin/user`, req.language));
      return;
    }
  } catch (err) {
    if (err instanceof ApiException) {
      logger.error(err, 'there was a problem saving the user roles');
      errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
    }
  }

  res.render('admin/user-roles', { user, userName, availableOrganisations, availableRoles, values, errors });
};

export const userStatus = async (req: Request, res: Response) => {
  const user: UserDTO = res.locals.user;
  const userName = user.name || user.email;
  let errors: ViewError[] = [];

  const action = user.status === UserStatus.Active ? UserAction.Deactivate : UserAction.Reactivate;

  try {
    if (req.method === 'POST') {
      if (action === UserAction.Deactivate) {
        await req.pubapi.updateUserStatus(user.id, UserStatus.Inactive);
      } else {
        await req.pubapi.updateUserStatus(user.id, UserStatus.Active);
      }
      req.session.flash = [{ key: `admin.user.${action}.success`, params: { userName } }];
      req.session.save();
      res.redirect(req.buildUrl(`/admin/user`, req.language));
      return;
    }
  } catch (err) {
    if (err instanceof ApiException) {
      logger.error(err, 'there was a problem updating the user status');
      errors = [{ field: 'api', message: { key: 'errors.try_later' } }];
    }
  }

  res.render('admin/user-status', { user, userName, action, errors });
};
