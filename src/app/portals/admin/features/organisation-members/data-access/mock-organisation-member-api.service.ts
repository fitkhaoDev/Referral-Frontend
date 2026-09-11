import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  ORGANISATION_MEMBER_SEED,
  ORGANISATION_SEED,
} from '../../_fixtures/organisation-catalog';
import {
  CreateOrganisationMemberPayload,
  OrganisationMember,
  UpdateOrganisationMemberPayload,
} from '../models/organisation-member.model';
import { OrganisationMemberApi } from './organisation-member-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();

function denorm(organisationId: Id): { name: string; code: string } | null {
  const org = ORGANISATION_SEED.find((o) => o.id === organisationId);
  return org ? { name: org.name, code: org.referralCode } : null;
}

/** Development-only in-memory {@link OrganisationMemberApi}. Fixtures only. */
@Injectable()
export class MockOrganisationMemberApiService extends OrganisationMemberApi {
  private readonly rows: OrganisationMember[] = ORGANISATION_MEMBER_SEED.map((m, i) => {
    const d = denorm(m.organisationId)!;
    return {
      id: m.id,
      organisationId: m.organisationId,
      organisationName: d.name,
      organisationReferralCode: d.code,
      name: m.name,
      specialisation: m.specialisation,
      mobile: m.mobile,
      email: m.email,
      status: m.status,
      createdAt: iso(180 - i * 12),
      updatedAt: iso(i),
    } satisfies OrganisationMember;
  });

  override list(query: PageQuery): Observable<Page<OrganisationMember>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) => `${r.name} ${r.email} ${r.mobile} ${r.organisationName}`,
        filter: (r, f) =>
          (f['organisationId'] ? r.organisationId === f['organisationId'] : true) &&
          (f['status'] ? r.status === f['status'] : true),
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'organisationName':
              return a.organisationName.localeCompare(b.organisationName);
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

  override get(id: Id): Observable<OrganisationMember> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({
          status: 404,
          code: 'ORGANISATION_MEMBER_NOT_FOUND',
          message: 'Organisation member not found.',
        });
  }

  override create(payload: CreateOrganisationMemberPayload): Observable<OrganisationMember> {
    const d = denorm(payload.organisationId);
    if (!d) {
      return mockFail({
        status: 404,
        code: 'ORGANISATION_NOT_FOUND',
        message: 'The selected organisation does not exist.',
        fieldErrors: { organisationId: ['Choose a valid organisation.'] },
      });
    }
    const email = payload.email.trim().toLowerCase();
    if (
      this.rows.some(
        (r) => r.organisationId === payload.organisationId && r.email.toLowerCase() === email,
      )
    ) {
      return mockFail({
        status: 409,
        code: 'ORGANISATION_MEMBER_EMAIL_TAKEN',
        message: 'A member with this email already exists in this organisation.',
        fieldErrors: { email: ['This email is already used by another member here.'] },
      });
    }
    const row: OrganisationMember = {
      id: fixtureId('omember', this.rows.length + 1),
      organisationId: payload.organisationId,
      organisationName: d.name,
      organisationReferralCode: d.code,
      name: payload.name.trim(),
      specialisation: payload.specialisation?.trim() || undefined,
      mobile: payload.mobile.trim(),
      email,
      status: payload.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(
    id: Id,
    payload: UpdateOrganisationMemberPayload,
  ): Observable<OrganisationMember> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({
        status: 404,
        code: 'ORGANISATION_MEMBER_NOT_FOUND',
        message: 'Organisation member not found.',
      });
    }
    const email = payload.email.trim().toLowerCase();
    if (
      this.rows.some(
        (r) =>
          r.id !== id &&
          r.organisationId === this.rows[idx].organisationId &&
          r.email.toLowerCase() === email,
      )
    ) {
      return mockFail({
        status: 409,
        code: 'ORGANISATION_MEMBER_EMAIL_TAKEN',
        message: 'Another member in this organisation already uses this email.',
        fieldErrors: { email: ['This email is already used by another member here.'] },
      });
    }
    const updated: OrganisationMember = {
      ...this.rows[idx],
      name: payload.name.trim(),
      specialisation: payload.specialisation?.trim() || undefined,
      mobile: payload.mobile.trim(),
      email,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<OrganisationMember> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({
        status: 404,
        code: 'ORGANISATION_MEMBER_NOT_FOUND',
        message: 'Organisation member not found.',
      });
    }
    const updated: OrganisationMember = {
      ...this.rows[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }
}
