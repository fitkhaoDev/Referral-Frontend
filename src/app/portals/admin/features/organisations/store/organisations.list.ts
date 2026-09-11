import { createListFeature } from '@shared/store/create-list-feature';
import { Organisation } from '../models/organisation.model';

/** List/query state for the Organisations admin screen. */
export const organisationsList = createListFeature<Organisation>({
  name: 'adminOrganisations',
  selectId: (organisation) => organisation.id,
  initialSort: [{ field: 'name', direction: 'asc' }],
});

export const ORGANISATION_FILTER_KEYS = ['status', 'organisationTypeId', 'passwordState'] as const;
