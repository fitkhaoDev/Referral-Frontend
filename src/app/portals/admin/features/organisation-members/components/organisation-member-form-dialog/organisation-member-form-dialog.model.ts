import { Id } from '@core/models/api.model';
import { OrganisationMember } from '../../models/organisation-member.model';

export type OrganisationMemberFormDialogData =
  | { readonly mode: 'create'; readonly organisationId?: Id }
  | { readonly mode: 'edit'; readonly member: OrganisationMember };
