import { createListFeature } from '@shared/store/create-list-feature';
import { OrganisationType } from '../models/organisation-type.model';

/** List/query state for the Organisation Types admin screen. */
export const organisationTypesList = createListFeature<OrganisationType>({
  name: 'adminOrganisationTypes',
  selectId: (type) => type.id,
  initialSort: [{ field: 'name', direction: 'asc' }],
  initialPageSize: 10,
});

export const ORGANISATION_TYPE_FILTER_KEYS = ['status'] as const;
