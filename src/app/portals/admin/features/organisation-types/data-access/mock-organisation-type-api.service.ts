import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationTypePayload,
  OrganisationType,
  UpdateOrganisationTypePayload,
} from '../models/organisation-type.model';
import { OrganisationTypeApi } from './organisation-type-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();

const SEED: Array<Omit<OrganisationType, 'id' | 'createdAt' | 'updatedAt'>> = [
  { name: 'Hospital', code: 'HOSPITAL', description: 'Multi-speciality and general hospitals.', status: 'ACTIVE', organisationCount: 14 },
  { name: 'Clinic', code: 'CLINIC', description: 'Standalone clinics and polyclinics.', status: 'ACTIVE', organisationCount: 38 },
  { name: 'Diagnostic Centre', code: 'DIAGNOSTIC_CENTRE', description: 'Pathology and imaging centres.', status: 'ACTIVE', organisationCount: 9 },
  { name: 'Gym Chain', code: 'GYM_CHAIN', description: 'Fitness chains and studios.', status: 'ACTIVE', organisationCount: 6 },
  { name: 'Corporate', code: 'CORPORATE', description: 'Employer wellness programmes.', status: 'ACTIVE', organisationCount: 11 },
  { name: 'Pharmacy Chain', code: 'PHARMACY_CHAIN', description: 'Retail pharmacy networks.', status: 'INACTIVE', organisationCount: 2 },
  { name: 'NGO', code: 'NGO', description: 'Non-profit health outreach partners.', status: 'INACTIVE', organisationCount: 1 },
];

/** Development-only in-memory {@link OrganisationTypeApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockOrganisationTypeApiService extends OrganisationTypeApi {
  private readonly rows: OrganisationType[] = SEED.map((s, i) => ({
    ...s,
    id: fixtureId('otype', i + 1),
    createdAt: iso(150 - i * 12),
    updatedAt: iso(i * 3),
  }));

  override list(query: PageQuery): Observable<Page<OrganisationType>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) => `${r.name} ${r.code}`,
        filter: (r, f) => (f['status'] ? r.status === f['status'] : true),
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'code':
              return a.code.localeCompare(b.code);
            case 'organisationCount':
              return a.organisationCount - b.organisationCount;
            case 'status':
              return a.status.localeCompare(b.status);
            case 'createdAt':
              return a.createdAt.localeCompare(b.createdAt);
            default:
              return a.name.localeCompare(b.name);
          }
        },
      }),
    );
  }

  override get(id: Id): Observable<OrganisationType> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({
          status: 404,
          code: 'ORGANISATION_TYPE_NOT_FOUND',
          message: 'Organisation type not found.',
        });
  }

  override create(payload: CreateOrganisationTypePayload): Observable<OrganisationType> {
    const code = payload.code.trim().toUpperCase();
    if (this.rows.some((r) => r.code === code)) {
      return mockFail({
        status: 409,
        code: 'ORGANISATION_TYPE_CODE_TAKEN',
        message: 'That code is already in use.',
        fieldErrors: { code: ['This code is already used by another organisation type.'] },
      });
    }
    const row: OrganisationType = {
      id: fixtureId('otype', this.rows.length + 1),
      name: payload.name.trim(),
      code,
      description: payload.description?.trim() || undefined,
      status: payload.status,
      organisationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdateOrganisationTypePayload): Observable<OrganisationType> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index < 0) {
      return mockFail({
        status: 404,
        code: 'ORGANISATION_TYPE_NOT_FOUND',
        message: 'Organisation type not found.',
      });
    }
    const updated: OrganisationType = {
      ...this.rows[index],
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      status: payload.status,
      updatedAt: new Date().toISOString(),
    };
    this.rows[index] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<OrganisationType> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index < 0) {
      return mockFail({
        status: 404,
        code: 'ORGANISATION_TYPE_NOT_FOUND',
        message: 'Organisation type not found.',
      });
    }
    const updated: OrganisationType = {
      ...this.rows[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.rows[index] = updated;
    return mockOk(updated);
  }
}
