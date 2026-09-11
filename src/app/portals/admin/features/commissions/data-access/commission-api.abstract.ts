import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { Commission } from '../models/commission.model';

/**
 * Commissions contract (admin, permission `commission:read`). Read-only.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list   GET   /api/admin/commissions
 *   query   page, size, sort=<field>,<dir>,
 *           search (reference, customerRef, referralCode, transactionRef,
 *                   partnerName, organisationName, memberName),
 *           fromDate=YYYY-MM-DD, toDate=YYYY-MM-DD  (inclusive, on occurredAt),
 *           status, beneficiaryType, incentiveType, organisationId, eventCode
 *   res     200 Page<Commission>
 *
 * get    GET   /api/admin/commissions/{id}
 *   res     200 Commission | 404 COMMISSION_NOT_FOUND
 *
 * Every amount and `status` are backend-computed. `ruleSnapshot` is immutable — a
 * later incentive-rule change never rewrites an existing commission.
 */
export abstract class CommissionApi {
  abstract list(query: PageQuery): Observable<Page<Commission>>;
  abstract get(id: Id): Observable<Commission>;
}
