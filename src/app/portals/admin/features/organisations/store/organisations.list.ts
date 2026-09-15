import { createListFeature } from '@shared/store/create-list-feature';
import { Organisation } from '../models/organisation.model';

/** List/query state for the Organisations admin screen. */
export const organisationsList = createListFeature<Organisation>({
  name: 'adminOrganisations',
  selectId: (organisation) => organisation.id,
  initialPageSize: 10,
  initialSort: [{ field: 'createdAt', direction: 'desc' }],
});

export const ORGANISATION_FILTER_KEYS = ['status', 'organisationTypeId', 'passwordState'] as const;
