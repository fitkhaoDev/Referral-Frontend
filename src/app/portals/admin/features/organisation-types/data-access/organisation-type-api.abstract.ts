import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationTypePayload,
  OrganisationType,
  UpdateOrganisationTypePayload,
} from '../models/organisation-type.model';

/**
 * Organisation Types contract (admin, permission `organisation-type:manage`).
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * list       GET   /api/admin/organisation-types
 *   query    page, size, sort=<field>,<dir>, search (name + code), status
 *   res      200 Page<OrganisationType>
 *
 * get        GET   /api/admin/organisation-types/{id}
 *   res      200 OrganisationType | 404 ORGANISATION_TYPE_NOT_FOUND
 *
 * create     POST  /api/admin/organisation-types
 *   body     CreateOrganisationTypePayload
 *   res      201 OrganisationType
 *   err      409 ORGANISATION_TYPE_CODE_TAKEN (fieldErrors.code) | 422 VALIDATION
 *
 * update     PUT   /api/admin/organisation-types/{id}
 *   body     UpdateOrganisationTypePayload  (code immutable — not accepted)
 *   res      200 OrganisationType | 404
 *
 * setStatus  PATCH /api/admin/organisation-types/{id}/status
 *   body     { status: EntityStatus }
 *   res      200 OrganisationType
 *   err      409 ORGANISATION_TYPE_IN_USE  (backend may block deactivating a type with active organisations)
 */
export abstract class OrganisationTypeApi {
  abstract list(query: PageQuery): Observable<Page<OrganisationType>>;
  abstract get(id: Id): Observable<OrganisationType>;
  abstract create(payload: CreateOrganisationTypePayload): Observable<OrganisationType>;
  abstract update(id: Id, payload: UpdateOrganisationTypePayload): Observable<OrganisationType>;
  abstract setStatus(id: Id, status: EntityStatus): Observable<OrganisationType>;
}
