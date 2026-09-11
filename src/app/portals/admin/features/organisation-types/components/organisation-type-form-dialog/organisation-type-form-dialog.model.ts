import { OrganisationType } from '../../models/organisation-type.model';

export type OrganisationTypeFormDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly organisationType: OrganisationType };
