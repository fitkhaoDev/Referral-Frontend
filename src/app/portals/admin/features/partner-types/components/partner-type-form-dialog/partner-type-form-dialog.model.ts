import { PartnerType } from '../../models/partner-type.model';

export type PartnerTypeFormDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly partnerType: PartnerType };
