import { createListFeature } from '@shared/store/create-list-feature';
import { OrganisationMember } from '../models/organisation-member.model';

/** List/query state for the Organisation Members admin screen (also reused, org-scoped, on the org detail). */
export const organisationMembersList = createListFeature<OrganisationMember>({
  name: 'adminOrganisationMembers',
  selectId: (member) => member.id,
  initialSort: [{ field: 'name', direction: 'asc' }],
});

export const ORGANISATION_MEMBER_FILTER_KEYS = ['organisationId', 'status'] as const;
