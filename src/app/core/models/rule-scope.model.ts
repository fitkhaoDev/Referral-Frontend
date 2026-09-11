import { Id } from './api.model';

/** What a discount / incentive rule applies to. */
export type RuleScopeType = 'GLOBAL' | 'PARTNER_TYPE' | 'ORGANISATION_TYPE' | 'ORGANISATION';

export const RULE_SCOPE_TYPE_LABEL: Record<RuleScopeType, string> = {
  GLOBAL: 'All partners',
  PARTNER_TYPE: 'Partner type',
  ORGANISATION_TYPE: 'Organisation type',
  ORGANISATION: 'Organisation',
};

/** Scope reference stored on a rule. `scopeId` is absent for `GLOBAL`. */
export interface RuleScope {
  readonly scopeType: RuleScopeType;
  readonly scopeId?: Id;
  /** Denormalised label for display, e.g. `"Doctor"`, `"Apollo Hospital — Dum Dum"`. */
  readonly scopeLabel: string;
}
