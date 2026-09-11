import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationMemberPayload,
  OrganisationMember,
  UpdateOrganisationMemberPayload,
} from '../models/organisation-member.model';

/**
 * Organisation Members contract (admin, permission `organisation-member:manage`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list       GET   /api/admin/organisation-members
 *   query    page, size, sort=<field>,<dir>,
 *            search (name, email, mobile, organisationName),
 *            organisationId, status
 *   res      200 Page<OrganisationMember>
 *
 * get        GET   /api/admin/organisation-members/{id}
 *   res      200 OrganisationMember | 404 ORGANISATION_MEMBER_NOT_FOUND
 *
 * create     POST  /api/admin/organisation-members
 *   body     CreateOrganisationMemberPayload  (organisationId required)
 *   res      201 OrganisationMember
 *   err      404 ORGANISATION_NOT_FOUND     (bad organisationId)
 *            409 ORGANISATION_MEMBER_EMAIL_TAKEN  (fieldErrors.email — unique within the org)
 *            422 VALIDATION
 *
 * update     PUT   /api/admin/organisation-members/{id}
 *   body     UpdateOrganisationMemberPayload  (organisationId is NOT movable here)
 *   res      200 OrganisationMember | 404 | 409
 *
 * setStatus  PATCH /api/admin/organisation-members/{id}/status
 *   body     { status: EntityStatus }
 *   res      200 OrganisationMember
 *   note     A deactivated member cannot be chosen as "Referred By" for new
 *            attributions; existing attributions and their commissions are retained.
 */
export abstract class OrganisationMemberApi {
  abstract list(query: PageQuery): Observable<Page<OrganisationMember>>;
  abstract get(id: Id): Observable<OrganisationMember>;
  abstract create(payload: CreateOrganisationMemberPayload): Observable<OrganisationMember>;
  abstract update(
    id: Id,
    payload: UpdateOrganisationMemberPayload,
  ): Observable<OrganisationMember>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<OrganisationMember>;
}
