import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateDiscountRulePayload,
  DiscountRule,
  UpdateDiscountRulePayload,
} from '../models/discount-rule.model';

/**
 * Discount Rules contract (admin, permission `discount-rule:manage`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list       GET   /api/admin/discount-rules
 *   query    page, size, sort=<field>,<dir>, search (name, scopeLabel), scopeType, status
 *   res      200 Page<DiscountRule>
 *
 * get        GET   /api/admin/discount-rules/{id}
 *   res      200 DiscountRule | 404 DISCOUNT_RULE_NOT_FOUND
 *
 * create     POST  /api/admin/discount-rules
 *   body     CreateDiscountRulePayload
 *   res      201 DiscountRule  (version = 1)
 *   err      409 DISCOUNT_RULE_SCOPE_CONFLICT  (an active rule already covers this exact scope)
 *            422 VALIDATION                    (fieldErrors: discount.percent / discount.amount / …)
 *
 * update     PUT   /api/admin/discount-rules/{id}
 *   body     UpdateDiscountRulePayload  (full replace)
 *   res      200 DiscountRule  (backend increments `version`)
 *   note     Historical discounts already applied to customers are NOT recalculated.
 *
 * setStatus  PATCH /api/admin/discount-rules/{id}/status
 *   body     { status: EntityStatus }
 *   res      200 DiscountRule
 */
export abstract class DiscountRuleApi {
  abstract list(query: PageQuery): Observable<Page<DiscountRule>>;
  abstract get(id: Id): Observable<DiscountRule>;
  abstract create(payload: CreateDiscountRulePayload): Observable<DiscountRule>;
  abstract update(id: Id, payload: UpdateDiscountRulePayload): Observable<DiscountRule>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<DiscountRule>;
}
