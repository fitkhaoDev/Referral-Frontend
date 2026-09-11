import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import {
  CreatePartnerPayload,
  Partner,
  PartnerAccountStatus,
  PartnerPasswordResetResult,
  UpdatePartnerPayload,
} from '../models/partner.model';
import { PartnerApi } from './partner-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();

/** Must line up with MockPartnerTypeApiService's seed ids/codes. */
const TYPES: Array<{ id: Id; name: string; code: string }> = [
  { id: 'ptype-000001', name: 'Doctor', code: 'DOCTOR' },
  { id: 'ptype-000002', name: 'Nutritionist', code: 'NUTRITIONIST' },
  { id: 'ptype-000003', name: 'Fitness Trainer', code: 'FITNESS_TRAINER' },
  { id: 'ptype-000004', name: 'Physiotherapist', code: 'PHYSIOTHERAPIST' },
  { id: 'ptype-000005', name: 'Influencer', code: 'INFLUENCER' },
  { id: 'ptype-000006', name: 'Consultant', code: 'CONSULTANT' },
];

const NAMES = [
  'Dr. John Doe', 'Dr. Anaya Mehta', 'Ritu Sharma', 'Karan Malhotra', 'Dr. Sana Iqbal',
  'Vikram Rao', 'Priya Nair', 'Dr. Alok Verma', 'Neha Gupta', 'Rahul Bose',
  'Dr. Meera Krishnan', 'Sameer Khan', 'Ananya Roy', 'Dr. Farhan Ali', 'Deepak Joshi',
  'Kavya Reddy', 'Dr. Nikhil Sinha', 'Tanvi Desai', 'Arjun Pillai', 'Dr. Isha Kapoor',
  'Rohit Menon', 'Sneha Iyer', 'Dr. Manish Tiwari', 'Pooja Bhatt',
];

function slugCode(name: string, n: number): string {
  const base = name
    .replace(/^Dr\.?\s+/i, '')
    .replace(/[^a-z]/gi, '')
    .toUpperCase()
    .slice(0, 6);
  return `${base}${String(10 + (n % 90))}`;
}

/** Development-only in-memory {@link PartnerApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockPartnerApiService extends PartnerApi {
  private readonly rows: Partner[] = NAMES.map((name, i) => {
    const type = TYPES[i % TYPES.length];
    const status: PartnerAccountStatus = i % 7 === 6 ? 'INACTIVE' : 'ACTIVE';
    return {
      id: fixtureId('partner', i + 1),
      partnerId: `FK-IND-${String(i + 1).padStart(6, '0')}`,
      name,
      partnerTypeId: type.id,
      partnerTypeName: type.name,
      partnerTypeCode: type.code,
      specialisation:
        type.code === 'DOCTOR'
          ? ['Cardiology', 'Endocrinology', 'Orthopaedics', 'General Medicine'][i % 4]
          : undefined,
      mobile: `+91 9${String(800000000 + i * 111111).slice(0, 9)}`,
      email: `${name.replace(/^Dr\.?\s+/i, '').split(' ')[0].toLowerCase()}.${i + 1}@example.com`,
      professionalAddress: `${100 + i} Wellness Street, Bengaluru 5600${String(10 + i).slice(-2)}`,
      referralCode: slugCode(name, i),
      status,
      passwordState: i % 5 === 0 ? 'MUST_CHANGE' : 'OK',
      createdAt: iso(240 - i * 9),
      updatedAt: iso(i),
      deactivatedAt: status === 'INACTIVE' ? iso(i) : undefined,
    } satisfies Partner;
  });

  override list(query: PageQuery): Observable<Page<Partner>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) =>
          `${r.name} ${r.partnerId} ${r.email} ${r.mobile} ${r.referralCode} ${r.partnerTypeName}`,
        filter: (r, f) =>
          (f['status'] ? r.status === f['status'] : true) &&
          (f['partnerTypeId'] ? r.partnerTypeId === f['partnerTypeId'] : true) &&
          (f['passwordState'] ? r.passwordState === f['passwordState'] : true),
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'partnerId':
              return a.partnerId.localeCompare(b.partnerId);
            case 'partnerTypeName':
              return a.partnerTypeName.localeCompare(b.partnerTypeName);
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

  override get(id: Id): Observable<Partner> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'PARTNER_NOT_FOUND', message: 'Partner not found.' });
  }

  override create(payload: CreatePartnerPayload): Observable<Partner> {
    const email = payload.email.trim().toLowerCase();
    const referralCode = payload.referralCode.trim().toUpperCase();
    if (this.rows.some((r) => r.email.toLowerCase() === email)) {
      return mockFail({
        status: 409,
        code: 'PARTNER_EMAIL_TAKEN',
        message: 'That email is already registered.',
        fieldErrors: { email: ['A partner with this email already exists.'] },
      });
    }
    if (this.rows.some((r) => r.referralCode.toUpperCase() === referralCode)) {
      return mockFail({
        status: 409,
        code: 'PARTNER_REFERRAL_CODE_TAKEN',
        message: 'That referral code is already in use.',
        fieldErrors: { referralCode: ['This referral code is already taken.'] },
      });
    }
    const type = TYPES.find((t) => t.id === payload.partnerTypeId) ?? TYPES[0];
    const index = this.rows.length + 1;
    const row: Partner = {
      id: fixtureId('partner', index),
      partnerId: `FK-IND-${String(index).padStart(6, '0')}`,
      name: payload.name.trim(),
      partnerTypeId: type.id,
      partnerTypeName: type.name,
      partnerTypeCode: type.code,
      specialisation: payload.specialisation?.trim() || undefined,
      mobile: payload.mobile.trim(),
      email,
      professionalAddress: payload.professionalAddress?.trim() || undefined,
      referralCode,
      status: payload.status,
      passwordState: 'MUST_CHANGE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdatePartnerPayload): Observable<Partner> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({ status: 404, code: 'PARTNER_NOT_FOUND', message: 'Partner not found.' });
    }
    const email = payload.email.trim().toLowerCase();
    if (this.rows.some((r) => r.id !== id && r.email.toLowerCase() === email)) {
      return mockFail({
        status: 409,
        code: 'PARTNER_EMAIL_TAKEN',
        message: 'That email is already registered.',
        fieldErrors: { email: ['Another partner already uses this email.'] },
      });
    }
    const type = TYPES.find((t) => t.id === payload.partnerTypeId) ?? TYPES[0];
    const updated: Partner = {
      ...this.rows[idx],
      name: payload.name.trim(),
      partnerTypeId: type.id,
      partnerTypeName: type.name,
      partnerTypeCode: type.code,
      specialisation: payload.specialisation?.trim() || undefined,
      mobile: payload.mobile.trim(),
      email,
      professionalAddress: payload.professionalAddress?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: PartnerAccountStatus): Observable<Partner> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({ status: 404, code: 'PARTNER_NOT_FOUND', message: 'Partner not found.' });
    }
    const updated: Partner = {
      ...this.rows[idx],
      status,
      updatedAt: new Date().toISOString(),
      deactivatedAt: status === 'INACTIVE' ? new Date().toISOString() : undefined,
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override resetPassword(id: Id): Observable<PartnerPasswordResetResult> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({ status: 404, code: 'PARTNER_NOT_FOUND', message: 'Partner not found.' });
    }
    this.rows[idx] = {
      ...this.rows[idx],
      passwordState: 'MUST_CHANGE',
      updatedAt: new Date().toISOString(),
    };
    const temporaryPassword = `Fk-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;
    return mockOk({
      partnerId: this.rows[idx].partnerId,
      passwordState: 'MUST_CHANGE',
      delivery: 'ADMIN_DISPLAY',
      temporaryPassword,
    });
  }
}
