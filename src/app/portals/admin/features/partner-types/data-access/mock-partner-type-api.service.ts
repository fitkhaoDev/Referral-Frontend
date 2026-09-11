import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreatePartnerTypePayload,
  PartnerType,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';
import { PartnerTypeApi } from './partner-type-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();

const SEED: Array<Omit<PartnerType, 'id' | 'createdAt' | 'updatedAt'>> = [
  { name: 'Doctor', code: 'DOCTOR', description: 'Registered medical practitioners.', status: 'ACTIVE', partnerCount: 128 },
  { name: 'Nutritionist', code: 'NUTRITIONIST', description: 'Certified nutrition and diet consultants.', status: 'ACTIVE', partnerCount: 64 },
  { name: 'Fitness Trainer', code: 'FITNESS_TRAINER', description: 'Personal trainers and gym instructors.', status: 'ACTIVE', partnerCount: 91 },
  { name: 'Physiotherapist', code: 'PHYSIOTHERAPIST', description: 'Rehabilitation and physical therapy specialists.', status: 'ACTIVE', partnerCount: 37 },
  { name: 'Influencer', code: 'INFLUENCER', description: 'Health & wellness content creators.', status: 'ACTIVE', partnerCount: 22 },
  { name: 'Consultant', code: 'CONSULTANT', description: 'Independent wellness consultants.', status: 'ACTIVE', partnerCount: 15 },
  { name: 'Dietitian', code: 'DIETITIAN', description: 'Clinical dietitians.', status: 'ACTIVE', partnerCount: 40 },
  { name: 'Yoga Instructor', code: 'YOGA_INSTRUCTOR', description: 'Certified yoga teachers.', status: 'INACTIVE', partnerCount: 8 },
  { name: 'Chiropractor', code: 'CHIROPRACTOR', description: 'Spinal and musculoskeletal care.', status: 'INACTIVE', partnerCount: 3 },
  { name: 'Sports Coach', code: 'SPORTS_COACH', description: 'Sport-specific performance coaches.', status: 'ACTIVE', partnerCount: 12 },
];

/** Development-only in-memory {@link PartnerTypeApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockPartnerTypeApiService extends PartnerTypeApi {
  private readonly rows: PartnerType[] = SEED.map((s, i) => ({
    ...s,
    id: fixtureId('ptype', i + 1),
    createdAt: iso(120 - i * 7),
    updatedAt: iso(i * 2),
  }));

  override list(query: PageQuery): Observable<Page<PartnerType>> {
    const page = paginate(this.rows, query, {
      searchable: (r) => `${r.name} ${r.code}`,
      filter: (r, f) => (f['status'] ? r.status === f['status'] : true),
      comparator: (sort) => (a, b) => {
        switch (sort.field) {
          case 'code':
            return a.code.localeCompare(b.code);
          case 'partnerCount':
            return a.partnerCount - b.partnerCount;
          case 'status':
            return a.status.localeCompare(b.status);
          case 'createdAt':
            return a.createdAt.localeCompare(b.createdAt);
          default:
            return a.name.localeCompare(b.name);
        }
      },
    });
    return mockOk(page);
  }

  override get(id: Id): Observable<PartnerType> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'PARTNER_TYPE_NOT_FOUND', message: 'Partner type not found.' });
  }

  override create(payload: CreatePartnerTypePayload): Observable<PartnerType> {
    const code = payload.code.trim().toUpperCase();
    if (this.rows.some((r) => r.code === code)) {
      return mockFail({
        status: 409,
        code: 'PARTNER_TYPE_CODE_TAKEN',
        message: 'That code is already in use.',
        fieldErrors: { code: ['This code is already used by another partner type.'] },
      });
    }
    const row: PartnerType = {
      id: fixtureId('ptype', this.rows.length + 1),
      name: payload.name.trim(),
      code,
      description: payload.description?.trim() || undefined,
      status: payload.status,
      partnerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdatePartnerTypePayload): Observable<PartnerType> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index < 0) {
      return mockFail({ status: 404, code: 'PARTNER_TYPE_NOT_FOUND', message: 'Partner type not found.' });
    }
    const updated: PartnerType = {
      ...this.rows[index],
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      status: payload.status,
      updatedAt: new Date().toISOString(),
    };
    this.rows[index] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<PartnerType> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index < 0) {
      return mockFail({ status: 404, code: 'PARTNER_TYPE_NOT_FOUND', message: 'Partner type not found.' });
    }
    const updated: PartnerType = { ...this.rows[index], status, updatedAt: new Date().toISOString() };
    this.rows[index] = updated;
    return mockOk(updated);
  }
}
