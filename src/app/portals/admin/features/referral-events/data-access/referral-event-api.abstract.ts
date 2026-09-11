import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateReferralEventPayload,
  ReferralEvent,
  UpdateReferralEventPayload,
} from '../models/referral-event.model';

/**
 * Referral Events contract (admin, permission `referral-event:manage`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list       GET   /api/admin/referral-events
 *   query    page, size, sort=<field>,<dir>, search (name + code), status, system=true|false
 *   res      200 Page<ReferralEvent>
 *
 * get        GET   /api/admin/referral-events/{id}
 *   res      200 ReferralEvent | 404 REFERRAL_EVENT_NOT_FOUND
 *
 * create     POST  /api/admin/referral-events
 *   body     CreateReferralEventPayload
 *   res      201 ReferralEvent
 *   err      409 REFERRAL_EVENT_CODE_TAKEN (fieldErrors.code) | 422 VALIDATION
 *
 * update     PUT   /api/admin/referral-events/{id}
 *   body     UpdateReferralEventPayload  (code immutable — not accepted)
 *   res      200 ReferralEvent | 404
 *
 * setStatus  PATCH /api/admin/referral-events/{id}/status
 *   body     { status: EntityStatus }
 *   res      200 ReferralEvent
 *   note     A `system` event may be deactivated but its code keeps working for
 *            historical commissions. Deactivation is not deletion.
 */
export abstract class ReferralEventApi {
  abstract list(query: PageQuery): Observable<Page<ReferralEvent>>;
  abstract get(id: Id): Observable<ReferralEvent>;
  abstract create(payload: CreateReferralEventPayload): Observable<ReferralEvent>;
  abstract update(id: Id, payload: UpdateReferralEventPayload): Observable<ReferralEvent>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<ReferralEvent>;
}
