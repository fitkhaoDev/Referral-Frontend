import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import {
  CreatePartnerPayload,
  Partner,
  PartnerAccountStatus,
  PartnerPasswordResetResult,
  UpdatePartnerPayload,
} from '../models/partner.model';

/**
 * Partners contract — INDIVIDUAL partners (admin, permissions `partner:read` /
 * `partner:write` / `partner:activate` / `partner:reset-password`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list          GET   /api/admin/partners
 *   query       page, size, sort=<field>,<dir>,
 *               search (name, partnerId, email, mobile, referralCode),
 *               status, partnerTypeId, passwordState
 *   res         200 Page<Partner>
 *
 * get           GET   /api/admin/partners/{id}
 *   res         200 Partner | 404 PARTNER_NOT_FOUND
 *
 * create        POST  /api/admin/partners
 *   body        CreatePartnerPayload  (admin provides the initial/temporary password)
 *   res         201 Partner  (backend assigns `partnerId`; `passwordState = MUST_CHANGE`)
 *   err         409 PARTNER_EMAIL_TAKEN            (fieldErrors.email)
 *               409 PARTNER_MOBILE_TAKEN           (fieldErrors.mobile)
 *               409 PARTNER_REFERRAL_CODE_TAKEN    (fieldErrors.referralCode)
 *               422 VALIDATION                     (incl. fieldErrors.initialPassword for policy)
 *
 * update        PUT   /api/admin/partners/{id}
 *   body        UpdatePartnerPayload
 *               (partnerId, referralCode, status, password are NOT editable here)
 *   res         200 Partner | 404 | 409 (email/mobile taken)
 *
 * setStatus     PATCH /api/admin/partners/{id}/status
 *   body        { status: PartnerAccountStatus }
 *   res         200 Partner
 *   note        Deactivation blocks login but retains referrals, commissions, wallet
 *               and withdrawal history. It is not deletion.
 *
 * resetPassword POST  /api/admin/partners/{id}/reset-password
 *   body        {}
 *   res         200 PartnerPasswordResetResult
 *   note        A NEW temporary password is generated per backend policy;
 *               `passwordState` becomes MUST_CHANGE. The admin never sees the
 *               partner's EXISTING password. Whether the new temp password is
 *               returned to the admin (`delivery: ADMIN_DISPLAY`) or delivered
 *               out-of-band (SMS/EMAIL) is a backend-policy decision — OPEN QUESTION.
 */
export abstract class PartnerApi {
  abstract list(query: PageQuery): Observable<Page<Partner>>;
  abstract get(id: Id): Observable<Partner>;
  abstract create(payload: CreatePartnerPayload): Observable<Partner>;
  abstract update(id: Id, payload: UpdatePartnerPayload): Observable<Partner>;
  abstract setStatus(id: Id, status: PartnerAccountStatus): Observable<Partner>;
  abstract resetPassword(id: Id): Observable<PartnerPasswordResetResult>;
}
