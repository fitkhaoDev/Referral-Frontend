import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { Referral } from '../models/referral.model';

/**
 * Referrals contract (admin, permission `referral:read`). Read-only.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list   GET   /api/admin/referrals
 *   query   page, size, sort=<field>,<dir>,
 *           search (reference, customerRef, referralCode, transactionRef, partnerName, organisationName),
 *           fromDate=YYYY-MM-DD, toDate=YYYY-MM-DD  (inclusive, on occurredAt),
 *           partnerCategory, organisationId, referringMemberId, eventCode,
 *           commissionStatus, plan
 *   res     200 Page<Referral>
 *   note    Every monetary field and `commissionStatus` is backend-computed.
 *
 * get    GET   /api/admin/referrals/{id}
 *   res     200 Referral | 404 REFERRAL_NOT_FOUND
 */
export abstract class ReferralApi {
  abstract list(query: PageQuery): Observable<Page<Referral>>;
  abstract get(id: Id): Observable<Referral>;
}
