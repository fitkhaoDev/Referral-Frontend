import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import {
  MarkWithdrawalFailedPayload,
  MarkWithdrawalPaidPayload,
  RejectWithdrawalPayload,
  Withdrawal,
  WithdrawalPolicy,
} from '../models/withdrawal.model';

/**
 * Withdrawals contract (admin, permission `withdrawal:read` to view, `withdrawal:manage`
 * to act).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list      GET  /api/admin/withdrawals
 *   query   page, size, sort=<field>,<dir>,
 *           search (reference, partnerName, organisationName, memberName,
 *                   paymentReference),
 *           status, beneficiaryType, organisationId,
 *           fromDate=YYYY-MM-DD, toDate=YYYY-MM-DD  (inclusive, on requestedAt)
 *   res     200 Page<Withdrawal>
 *
 * get       GET  /api/admin/withdrawals/{id}
 *   res     200 Withdrawal | 404 WITHDRAWAL_NOT_FOUND
 *
 * policy    GET  /api/admin/withdrawals/policy
 *   res     200 WithdrawalPolicy
 *   NOTE    The min amount and monthly cap live here. The UI must render them from
 *           this response and NEVER hardcode ₹4,000 / 2-per-month.
 *
 * approve         POST /api/admin/withdrawals/{id}/approve
 * reject          POST /api/admin/withdrawals/{id}/reject          { reason }
 * markProcessing  POST /api/admin/withdrawals/{id}/processing
 * markPaid        POST /api/admin/withdrawals/{id}/paid            { paymentReference }
 * markFailed      POST /api/admin/withdrawals/{id}/failed          { reason }
 *   res     200 Withdrawal (with refreshed `status` + `allowedActions`)
 *           409 WITHDRAWAL_TRANSITION_NOT_ALLOWED if the action is invalid for the
 *               current state (the backend is the sole authority on transitions).
 *           422 with fieldErrors for a missing/!invalid reason or paymentReference.
 *
 * Money fields (`amount`, `availableBalanceAtRequest`, policy amounts) are all
 * backend-computed. The client performs no balance or eligibility math.
 */
export abstract class WithdrawalApi {
  abstract list(query: PageQuery): Observable<Page<Withdrawal>>;
  abstract get(id: Id): Observable<Withdrawal>;
  abstract getPolicy(): Observable<WithdrawalPolicy>;

  abstract approve(id: Id): Observable<Withdrawal>;
  abstract reject(id: Id, payload: RejectWithdrawalPayload): Observable<Withdrawal>;
  abstract markProcessing(id: Id): Observable<Withdrawal>;
  abstract markPaid(id: Id, payload: MarkWithdrawalPaidPayload): Observable<Withdrawal>;
  abstract markFailed(id: Id, payload: MarkWithdrawalFailedPayload): Observable<Withdrawal>;
}
