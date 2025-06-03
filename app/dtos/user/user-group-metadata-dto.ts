import type { Locale } from '~/enums/locale';

export interface UserGroupMetadataDTO {
  id?: string;
  name?: string;
  email?: string;
  language?: Locale;
}
