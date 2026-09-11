import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus, PasswordResetResult } from '@core/models/common.model';
import {
  CreateOrganisationPayload,
  Organisation,
  UpdateOrganisationPayload,
} from '../models/organisation.model';

/**
 * Organisations contract (admin).
 * Permissions: `organisation:manage` for all operations.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list          GET   /api/admin/organisations
 *   query       page, size, sort=<field>,<dir>,
 *               search (name, partnerId, referralCode, contactPerson, email),
 *               status, organisationTypeId, passwordState
 *   res         200 Page<Organisation>
 *
 * get           GET   /api/admin/organisations/{id}
 *   res         200 Organisation | 404 ORGANISATION_NOT_FOUND
 *
 * create        POST  /api/admin/organisations
 *   body        CreateOrganisationPayload  (admin provides the initial password)
 *   res         201 Organisation  (backend assigns partnerId; passwordState = MUST_CHANGE)
 *   err         409 ORGANISATION_REFERRAL_CODE_TAKEN  (fieldErrors.referralCode)
 *               409 ORGANISATION_EMAIL_TAKEN          (fieldErrors.email)
 *               422 VALIDATION                        (incl. fieldErrors.initialPassword)
 *
 * update        PUT   /api/admin/organisations/{id}
 *   body        UpdateOrganisationPayload
 *               (partnerId, referralCode, status, password are NOT editable here)
 *   res         200 Organisation | 404 | 409
 *
 * setStatus     PATCH /api/admin/organisations/{id}/status
 *   body        { status: EntityStatus }
 *   res         200 Organisation
 *   note        A deactivated organisation cannot log in and its referral code
 *               cannot be used for new attributions. All history is retained.
 *
 * resetPassword POST  /api/admin/organisations/{id}/reset-password
 *   body        {}
 *   res         200 PasswordResetResult
 *   note        Same policy as partner reset — a NEW temporary password is issued,
 *               passwordState → MUST_CHANGE, the existing password is never shown.
 */
export abstract class OrganisationApi {
  abstract list(query: PageQuery): Observable<Page<Organisation>>;
  abstract get(id: Id): Observable<Organisation>;
  abstract create(payload: CreateOrganisationPayload): Observable<Organisation>;
  abstract update(id: Id, payload: UpdateOrganisationPayload): Observable<Organisation>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<Organisation>;
  abstract resetPassword(id: Id): Observable<PasswordResetResult>;
}
