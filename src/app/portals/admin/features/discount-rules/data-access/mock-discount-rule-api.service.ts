import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import { money } from '@core/models/money.model';
import { RULE_SCOPE_TYPE_LABEL } from '@core/models/rule-scope.model';
import {
  CreateDiscountRulePayload,
  DiscountRule,
  UpdateDiscountRulePayload,
} from '../models/discount-rule.model';
import { DiscountRuleApi } from './discount-rule-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();
const isoDate = (daysAgo: number): string => iso(daysAgo).slice(0, 10);

const SEED: Array<Omit<DiscountRule, 'id' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Standard customer discount',
    scopeType: 'GLOBAL',
    scopeLabel: RULE_SCOPE_TYPE_LABEL.GLOBAL,
    discount: { kind: 'PERCENT', percent: 10, maxAmount: money(2000) },
    status: 'ACTIVE',
    effectiveFrom: isoDate(120),
    version: 3,
  },
  {
    name: 'Doctor referral discount',
    scopeType: 'PARTNER_TYPE',
    scopeId: 'ptype-000001',
    scopeLabel: 'Doctor',
    discount: { kind: 'PERCENT', percent: 12 },
    status: 'ACTIVE',
    effectiveFrom: isoDate(90),
    version: 2,
  },
  {
    name: 'Apollo Dum Dum discount',
    scopeType: 'ORGANISATION',
    scopeId: 'org-000001',
    scopeLabel: 'Apollo Hospital — Dum Dum',
    discount: { kind: 'FIXED', amount: money(1500) },
    status: 'ACTIVE',
    effectiveFrom: isoDate(60),
    version: 1,
  },
  {
    name: 'Hospital partners discount',
    scopeType: 'ORGANISATION_TYPE',
    scopeId: 'otype-000001',
    scopeLabel: 'Hospital',
    discount: { kind: 'PERCENT', percent: 8 },
    status: 'ACTIVE',
    effectiveFrom: isoDate(45),
    version: 1,
  },
  {
    name: 'Influencer campaign (no discount)',
    scopeType: 'PARTNER_TYPE',
    scopeId: 'ptype-000005',
    scopeLabel: 'Influencer',
    discount: { kind: 'NONE' },
    status: 'INACTIVE',
    effectiveFrom: isoDate(30),
    version: 2,
  },
];

/** Development-only in-memory {@link DiscountRuleApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockDiscountRuleApiService extends DiscountRuleApi {
  private readonly rows: DiscountRule[] = SEED.map((s, i) => ({
    ...s,
    id: fixtureId('drule', i + 1),
    createdAt: iso(150 - i * 20),
    updatedAt: iso(i * 3),
  }));

  override list(query: PageQuery): Observable<Page<DiscountRule>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) => `${r.name} ${r.scopeLabel}`,
        filter: (r, f) =>
          (f['scopeType'] ? r.scopeType === f['scopeType'] : true) &&
          (f['status'] ? r.status === f['status'] : true),
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'scopeType':
              return a.scopeType.localeCompare(b.scopeType);
            case 'status':
              return a.status.localeCompare(b.status);
            case 'effectiveFrom':
              return a.effectiveFrom.localeCompare(b.effectiveFrom);
            default:
              return a.name.localeCompare(b.name);
          }
        },
      }),
    );
  }

  override get(id: Id): Observable<DiscountRule> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'DISCOUNT_RULE_NOT_FOUND', message: 'Discount rule not found.' });
  }

  override create(payload: CreateDiscountRulePayload): Observable<DiscountRule> {
    if (
      this.rows.some(
        (r) =>
          r.status === 'ACTIVE' &&
          r.scopeType === payload.scopeType &&
          (r.scopeId ?? null) === (payload.scopeId ?? null),
      )
    ) {
      return mockFail({
        status: 409,
        code: 'DISCOUNT_RULE_SCOPE_CONFLICT',
        message: 'An active discount rule already covers this scope.',
      });
    }
    const row: DiscountRule = {
      id: fixtureId('drule', this.rows.length + 1),
      name: payload.name.trim(),
      scopeType: payload.scopeType,
      scopeId: payload.scopeId,
      scopeLabel: this.labelFor(payload.scopeType, payload.scopeId),
      discount: payload.discount,
      status: payload.status,
      effectiveFrom: payload.effectiveFrom,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdateDiscountRulePayload): Observable<DiscountRule> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({
        status: 404,
        code: 'DISCOUNT_RULE_NOT_FOUND',
        message: 'Discount rule not found.',
      });
    }
    const updated: DiscountRule = {
      ...this.rows[idx],
      name: payload.name.trim(),
      scopeType: payload.scopeType,
      scopeId: payload.scopeId,
      scopeLabel: this.labelFor(payload.scopeType, payload.scopeId),
      discount: payload.discount,
      status: payload.status,
      effectiveFrom: payload.effectiveFrom,
      version: this.rows[idx].version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<DiscountRule> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({
        status: 404,
        code: 'DISCOUNT_RULE_NOT_FOUND',
        message: 'Discount rule not found.',
      });
    }
    const updated: DiscountRule = {
      ...this.rows[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  private labelFor(scopeType: DiscountRule['scopeType'], scopeId?: Id): string {
    if (scopeType === 'GLOBAL') return RULE_SCOPE_TYPE_LABEL.GLOBAL;
    const existing = this.rows.find((r) => r.scopeType === scopeType && r.scopeId === scopeId);
    return existing?.scopeLabel ?? `${RULE_SCOPE_TYPE_LABEL[scopeType]} ${scopeId ?? ''}`.trim();
  }
}
