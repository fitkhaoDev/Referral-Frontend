import { ReferralEvent } from '../../models/referral-event.model';

export type ReferralEventFormDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly event: ReferralEvent };
