import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus, PasswordResetResult } from '@core/models/common.model';
import { ORGANISATION_SEED, memberCountFor } from '../../_fixtures/organisation-catalog';
import {
  CreateOrganisationPayload,
  Organisation,
  UpdateOrganisationPayload,
} from '../models/organisation.model';
import { OrganisationApi } from './organisation-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();

/** Development-only in-memory {@link OrganisationApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockOrganisationApiService extends OrganisationApi {
  private readonly rows: Organisation[] = ORGANISATION_SEED.map((o, i) => ({
    id: o.id,
    partnerId: o.partnerId,
    name: o.name,
    organisationTypeId: o.organisationTypeId,
    organisationTypeName: o.organisationTypeName,
    referralCode: o.referralCode,
    contactPerson: o.contactPerson,
    mobile: o.mobile,
    email: o.email,
    address: o.address,
    status: o.status,
    passwordState: i % 3 === 0 ? 'MUST_CHANGE' : 'OK',
    memberCount: memberCountFor(o.id),
    createdAt: iso(200 - i * 20),
    updatedAt: iso(i * 2),
    deactivatedAt: o.status === 'INACTIVE' ? iso(i) : undefined,
  }));

  override list(query: PageQuery): Observable<Page<Organisation>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) =>
          `${r.name} ${r.partnerId} ${r.referralCode} ${r.contactPerson} ${r.email} ${r.organisationTypeName}`,
        filter: (r, f) =>
          (f['status'] ? r.status === f['status'] : true) &&
          (f['organisationTypeId'] ? r.organisationTypeId === f['organisationTypeId'] : true) &&
          (f['passwordState'] ? r.passwordState === f['passwordState'] : true),
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'partnerId':
              return a.partnerId.localeCompare(b.partnerId);
            case 'organisationTypeName':
              return a.organisationTypeName.localeCompare(b.organisationTypeName);
            case 'memberCount':
              return a.memberCount - b.memberCount;
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

  override get(id: Id): Observable<Organisation> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organisation not found.' });
  }

  override create(payload: CreateOrganisationPayload): Observable<Organisation> {
    const referralCode = payload.referralCode.trim().toUpperCase();
    const email = payload.email.trim().toLowerCase();
    if (this.rows.some((r) => r.referralCode.toUpperCase() === referralCode)) {
      return mockFail({
        status: 409,
        code: 'ORGANISATION_REFERRAL_CODE_TAKEN',
        message: 'That referral code is already in use.',
        fieldErrors: { referralCode: ['This referral code is already taken.'] },
      });
    }
    if (this.rows.some((r) => r.email.toLowerCase() === email)) {
      return mockFail({
        status: 409,
        code: 'ORGANISATION_EMAIL_TAKEN',
        message: 'That email is already registered.',
        fieldErrors: { email: ['An organisation with this email already exists.'] },
      });
    }
    const index = this.rows.length + 1;
    const typeName = ORGANISATION_SEED.find((s) => s.organisationTypeId === payload.organisationTypeId)
      ?.organisationTypeName;
    const row: Organisation = {
      id: fixtureId('org', index),
      partnerId: `FK-ORG-${String(index).padStart(6, '0')}`,
      name: payload.name.trim(),
      organisationTypeId: payload.organisationTypeId,
      organisationTypeName: typeName ?? 'Organisation',
      referralCode,
      contactPerson: payload.contactPerson.trim(),
      mobile: payload.mobile.trim(),
      email,
      address: payload.address.trim(),
      status: payload.status,
      passwordState: 'MUST_CHANGE',
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdateOrganisationPayload): Observable<Organisation> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({ status: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organisation not found.' });
    }
    const email = payload.email.trim().toLowerCase();
    if (this.rows.some((r) => r.id !== id && r.email.toLowerCase() === email)) {
      return mockFail({
        status: 409,
        code: 'ORGANISATION_EMAIL_TAKEN',
        message: 'That email is already registered.',
        fieldErrors: { email: ['Another organisation already uses this email.'] },
      });
    }
    const typeName =
      ORGANISATION_SEED.find((s) => s.organisationTypeId === payload.organisationTypeId)
        ?.organisationTypeName ?? this.rows[idx].organisationTypeName;
    const updated: Organisation = {
      ...this.rows[idx],
      name: payload.name.trim(),
      organisationTypeId: payload.organisationTypeId,
      organisationTypeName: typeName,
      contactPerson: payload.contactPerson.trim(),
      mobile: payload.mobile.trim(),
      email,
      address: payload.address.trim(),
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<Organisation> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({ status: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organisation not found.' });
    }
    const updated: Organisation = {
      ...this.rows[idx],
      status,
      updatedAt: new Date().toISOString(),
      deactivatedAt: status === 'INACTIVE' ? new Date().toISOString() : undefined,
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override resetPassword(id: Id): Observable<PasswordResetResult> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({ status: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organisation not found.' });
    }
    this.rows[idx] = {
      ...this.rows[idx],
      passwordState: 'MUST_CHANGE',
      updatedAt: new Date().toISOString(),
    };
    return mockOk({
      passwordState: 'MUST_CHANGE',
      delivery: 'ADMIN_DISPLAY',
      temporaryPassword: `Fk-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`,
    });
  }
}
