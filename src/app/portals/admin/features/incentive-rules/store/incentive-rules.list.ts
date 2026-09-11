import { createListFeature } from '@shared/store/create-list-feature';
import { IncentiveRule } from '../models/incentive-rule.model';

/** List/query state for the Incentive Rules admin screen. */
export const incentiveRulesList = createListFeature<IncentiveRule>({
  name: 'adminIncentiveRules',
  selectId: (rule) => rule.id,
  initialSort: [{ field: 'name', direction: 'asc' }],
});

export const INCENTIVE_RULE_FILTER_KEYS = ['scopeType', 'beneficiary', 'status'] as const;
