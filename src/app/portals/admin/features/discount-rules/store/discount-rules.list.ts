import { createListFeature } from '@shared/store/create-list-feature';
import { DiscountRule } from '../models/discount-rule.model';

/** List/query state for the Discount Rules admin screen. */
export const discountRulesList = createListFeature<DiscountRule>({
  name: 'adminDiscountRules',
  selectId: (rule) => rule.id,
  initialSort: [{ field: 'name', direction: 'asc' }],
  initialPageSize: 10,
});

export const DISCOUNT_RULE_FILTER_KEYS = ['scopeType', 'status'] as const;
