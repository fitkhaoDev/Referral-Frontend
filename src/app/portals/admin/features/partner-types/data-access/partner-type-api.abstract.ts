import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreatePartnerTypePayload,
  PartnerType,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';

/**
 * Partner Types contract (admin, permission `partner-type:manage`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list       GET   /api/admin/partner-types
 *   query    page, size, sort=<field>,<dir>, search (spans name + code), status
 *   res      200 Page<PartnerType>
 *
 * get        GET   /api/admin/partner-types/{id}
 *   res      200 PartnerType | 404 PARTNER_TYPE_NOT_FOUND
 *
 * create     POST  /api/admin/partner-types
 *   body     CreatePartnerTypePayload
 *   res      201 PartnerType
 *   err      409 PARTNER_TYPE_CODE_TAKEN   (fieldErrors.code)
 *            422 VALIDATION                (fieldErrors.*)
 *
 * update     PUT   /api/admin/partner-types/{id}
 *   body     UpdatePartnerTypePayload    (code is immutable — not accepted here)
 *   res      200 PartnerType | 404
 *
 * setStatus  PATCH /api/admin/partner-types/{id}/status
 *   body     { status: EntityStatus }
 *   res      200 PartnerType
 *   err      409 PARTNER_TYPE_IN_USE      (backend may block deactivating a type with active partners)
 *
 * Deactivation is not deletion — historical partners keep their type reference.
 */
export abstract class PartnerTypeApi {
  abstract list(query: PageQuery): Observable<Page<PartnerType>>;
  abstract get(id: Id): Observable<PartnerType>;
  abstract create(payload: CreatePartnerTypePayload): Observable<PartnerType>;
  abstract update(id: Id, payload: UpdatePartnerTypePayload): Observable<PartnerType>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<PartnerType>;
}
