import { DiscountRule } from '../../models/discount-rule.model';

export type DiscountRuleFormDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly rule: DiscountRule };
