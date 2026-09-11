import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateIncentiveRulePayload,
  IncentiveRule,
  UpdateIncentiveRulePayload,
} from '../models/incentive-rule.model';

/**
 * Incentive Rules contract (admin, permission `incentive-rule:manage`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list       GET   /api/admin/incentive-rules
 *   query    page, size, sort=<field>,<dir>, search (name, scopeLabel),
 *            scopeType, beneficiary, status
 *   res      200 Page<IncentiveRule>
 *
 * get        GET   /api/admin/incentive-rules/{id}
 *   res      200 IncentiveRule | 404 INCENTIVE_RULE_NOT_FOUND
 *
 * create     POST  /api/admin/incentive-rules
 *   body     CreateIncentiveRulePayload
 *   res      201 IncentiveRule  (version = 1)
 *   err      409 INCENTIVE_RULE_SCOPE_CONFLICT   (an active rule already covers this scope + beneficiary)
 *            422 VALIDATION                      (fieldErrors: counselling.percent, renewal.tiers[i].incentive.amount, …)
 *
 * update     PUT   /api/admin/incentive-rules/{id}
 *   body     UpdateIncentiveRulePayload  (full replace)
 *   res      200 IncentiveRule  (backend increments `version`)
 *   note     Historical commissions keep their rule snapshot and are NOT recalculated.
 *
 * setStatus  PATCH /api/admin/incentive-rules/{id}/status
 *   body     { status: EntityStatus }
 *   res      200 IncentiveRule
 *
 * The commission base (gross / discounted / net) is backend-determined and is not
 * part of the rule payload.
 */
export abstract class IncentiveRuleApi {
  abstract list(query: PageQuery): Observable<Page<IncentiveRule>>;
  abstract get(id: Id): Observable<IncentiveRule>;
  abstract create(payload: CreateIncentiveRulePayload): Observable<IncentiveRule>;
  abstract update(id: Id, payload: UpdateIncentiveRulePayload): Observable<IncentiveRule>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<IncentiveRule>;
}
