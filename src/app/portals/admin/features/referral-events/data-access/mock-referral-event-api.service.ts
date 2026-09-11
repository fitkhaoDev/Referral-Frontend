import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateReferralEventPayload,
  ReferralEvent,
  UpdateReferralEventPayload,
} from '../models/referral-event.model';
import { ReferralEventApi } from './referral-event-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();

const SEED: Array<Omit<ReferralEvent, 'id' | 'createdAt' | 'updatedAt'>> = [
  { name: 'Referral Created', code: 'REFERRAL_CREATED', description: 'A customer used a referral / coupon code.', status: 'ACTIVE', sortOrder: 10, system: true },
  { name: 'Coupon Used', code: 'COUPON_USED', description: 'Referral discount was applied at checkout.', status: 'ACTIVE', sortOrder: 20, system: true },
  { name: 'Counselling Completed', code: 'COUNSELLING_COMPLETED', description: 'The referred customer completed a counselling session.', status: 'ACTIVE', sortOrder: 30, system: true },
  { name: 'Subscription Purchased', code: 'SUBSCRIPTION_PURCHASED', description: 'First qualifying subscription purchase.', status: 'ACTIVE', sortOrder: 40, system: true },
  { name: 'Subscription Renewed', code: 'SUBSCRIPTION_RENEWED', description: 'An existing subscription was renewed.', status: 'ACTIVE', sortOrder: 50, system: true },
  { name: 'Payment Completed', code: 'PAYMENT_COMPLETED', description: 'Payment for a purchase/renewal settled.', status: 'ACTIVE', sortOrder: 60, system: true },
  { name: 'Payment Refunded', code: 'PAYMENT_REFUNDED', description: 'A payment was refunded — may trigger a reversal.', status: 'ACTIVE', sortOrder: 70, system: true },
  { name: 'Subscription Cancelled', code: 'SUBSCRIPTION_CANCELLED', description: 'A subscription was cancelled.', status: 'ACTIVE', sortOrder: 80, system: true },
  { name: 'Winback Purchase', code: 'WINBACK_PURCHASE', description: 'A lapsed customer resubscribed (custom event).', status: 'INACTIVE', sortOrder: 90, system: false },
];

/** Development-only in-memory {@link ReferralEventApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockReferralEventApiService extends ReferralEventApi {
  private readonly rows: ReferralEvent[] = SEED.map((s, i) => ({
    ...s,
    id: fixtureId('revent', i + 1),
    createdAt: iso(200 - i * 10),
    updatedAt: iso(i),
  }));

  override list(query: PageQuery): Observable<Page<ReferralEvent>> {
    const page = paginate(this.rows, query, {
      searchable: (r) => `${r.name} ${r.code}`,
      filter: (r, f) =>
        (f['status'] ? r.status === f['status'] : true) &&
        (f['system'] !== undefined && f['system'] !== ''
          ? String(r.system) === String(f['system'])
          : true),
      comparator: (sort) => (a, b) => {
        switch (sort.field) {
          case 'code':
            return a.code.localeCompare(b.code);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'status':
            return a.status.localeCompare(b.status);
          case 'createdAt':
            return a.createdAt.localeCompare(b.createdAt);
          default:
            return a.sortOrder - b.sortOrder;
        }
      },
    });
    return mockOk(page);
  }

  override get(id: Id): Observable<ReferralEvent> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'REFERRAL_EVENT_NOT_FOUND', message: 'Referral event not found.' });
  }

  override create(payload: CreateReferralEventPayload): Observable<ReferralEvent> {
    const code = payload.code.trim().toUpperCase();
    if (this.rows.some((r) => r.code === code)) {
      return mockFail({
        status: 409,
        code: 'REFERRAL_EVENT_CODE_TAKEN',
        message: 'That code is already in use.',
        fieldErrors: { code: ['This code is already used by another referral event.'] },
      });
    }
    const row: ReferralEvent = {
      id: fixtureId('revent', this.rows.length + 1),
      name: payload.name.trim(),
      code,
      description: payload.description?.trim() || undefined,
      status: payload.status,
      sortOrder: payload.sortOrder,
      system: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.push(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdateReferralEventPayload): Observable<ReferralEvent> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index < 0) {
      return mockFail({ status: 404, code: 'REFERRAL_EVENT_NOT_FOUND', message: 'Referral event not found.' });
    }
    const updated: ReferralEvent = {
      ...this.rows[index],
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      status: payload.status,
      sortOrder: payload.sortOrder,
      updatedAt: new Date().toISOString(),
    };
    this.rows[index] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<ReferralEvent> {
    const index = this.rows.findIndex((r) => r.id === id);
    if (index < 0) {
      return mockFail({ status: 404, code: 'REFERRAL_EVENT_NOT_FOUND', message: 'Referral event not found.' });
    }
    const updated: ReferralEvent = { ...this.rows[index], status, updatedAt: new Date().toISOString() };
    this.rows[index] = updated;
    return mockOk(updated);
  }
}
