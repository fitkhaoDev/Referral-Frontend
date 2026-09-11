import { IncentiveRule } from '../../models/incentive-rule.model';

export type IncentiveRuleFormDialogData =
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly rule: IncentiveRule };
