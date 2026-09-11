import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import { money } from '@core/models/money.model';
import { RULE_SCOPE_TYPE_LABEL } from '@core/models/rule-scope.model';
import {
  CreateIncentiveRulePayload,
  IncentiveComponent,
  IncentiveRule,
  UpdateIncentiveRulePayload,
} from '../models/incentive-rule.model';
import { IncentiveRuleApi } from './incentive-rule-api.abstract';

const NOW = Date.now();
const iso = (daysAgo: number): string => new Date(NOW - daysAgo * 86_400_000).toISOString();
const isoDate = (daysAgo: number): string => iso(daysAgo).slice(0, 10);

const pct = (percent: number): IncentiveComponent => ({ kind: 'PERCENT', percent });
const fix = (rupees: number): IncentiveComponent => ({ kind: 'FIXED', amount: money(rupees) });
const none: IncentiveComponent = { kind: 'NONE' };

type Seed = Omit<IncentiveRule, 'id' | 'createdAt' | 'updatedAt'>;

const SEED: Seed[] = [
  {
    name: 'Doctor incentives',
    scopeType: 'PARTNER_TYPE',
    scopeId: 'ptype-000001',
    scopeLabel: 'Doctor',
    beneficiary: 'PARTNER',
    counselling: fix(100),
    firstPurchase: pct(5),
    renewal: { kind: 'PERCENT_INDEFINITE', percent: 3 },
    status: 'ACTIVE',
    effectiveFrom: isoDate(120),
    version: 4,
  },
  {
    name: 'Nutritionist incentives',
    scopeType: 'PARTNER_TYPE',
    scopeId: 'ptype-000002',
    scopeLabel: 'Nutritionist',
    beneficiary: 'PARTNER',
    counselling: fix(200),
    firstPurchase: fix(500),
    renewal: { kind: 'NONE' },
    status: 'ACTIVE',
    effectiveFrom: isoDate(110),
    version: 2,
  },
  {
    name: 'Fitness Trainer incentives (tapering renewals)',
    scopeType: 'PARTNER_TYPE',
    scopeId: 'ptype-000003',
    scopeLabel: 'Fitness Trainer',
    beneficiary: 'PARTNER',
    counselling: fix(100),
    firstPurchase: pct(5),
    renewal: {
      kind: 'PER_RENEWAL',
      tiers: [
        { renewalNumber: 1, incentive: pct(3) },
        { renewalNumber: 2, incentive: pct(2) },
        { renewalNumber: 3, incentive: pct(1) },
      ],
      beyondLastTier: none,
    },
    status: 'ACTIVE',
    effectiveFrom: isoDate(90),
    version: 1,
  },
  {
    name: 'Physiotherapist incentives',
    scopeType: 'PARTNER_TYPE',
    scopeId: 'ptype-000004',
    scopeLabel: 'Physiotherapist',
    beneficiary: 'PARTNER',
    counselling: fix(100),
    firstPurchase: pct(5),
    renewal: { kind: 'PERCENT_INDEFINITE', percent: 5 },
    status: 'ACTIVE',
    effectiveFrom: isoDate(80),
    version: 1,
  },
  {
    name: 'Apollo Dum Dum — organisation incentive',
    scopeType: 'ORGANISATION',
    scopeId: 'org-000001',
    scopeLabel: 'Apollo Hospital — Dum Dum',
    beneficiary: 'ORGANISATION',
    counselling: none,
    firstPurchase: pct(2),
    renewal: { kind: 'PERCENT_INDEFINITE', percent: 2 },
    status: 'ACTIVE',
    effectiveFrom: isoDate(60),
    version: 2,
  },
  {
    name: 'Apollo Dum Dum — referring doctor incentive',
    scopeType: 'ORGANISATION',
    scopeId: 'org-000001',
    scopeLabel: 'Apollo Hospital — Dum Dum',
    beneficiary: 'DOCTOR',
    counselling: fix(100),
    firstPurchase: pct(5),
    renewal: { kind: 'PERCENT_INDEFINITE', percent: 3 },
    status: 'ACTIVE',
    effectiveFrom: isoDate(60),
    version: 1,
  },
  {
    name: 'Hospital partners — organisation incentive',
    scopeType: 'ORGANISATION_TYPE',
    scopeId: 'otype-000001',
    scopeLabel: 'Hospital',
    beneficiary: 'ORGANISATION',
    counselling: none,
    firstPurchase: pct(1.5),
    renewal: { kind: 'NONE' },
    status: 'INACTIVE',
    effectiveFrom: isoDate(45),
    version: 3,
  },
];

/** Development-only in-memory {@link IncentiveRuleApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockIncentiveRuleApiService extends IncentiveRuleApi {
  private readonly rows: IncentiveRule[] = SEED.map((s, i) => ({
    ...s,
    id: fixtureId('irule', i + 1),
    createdAt: iso(150 - i * 12),
    updatedAt: iso(i * 2),
  }));

  override list(query: PageQuery): Observable<Page<IncentiveRule>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) => `${r.name} ${r.scopeLabel}`,
        filter: (r, f) =>
          (f['scopeType'] ? r.scopeType === f['scopeType'] : true) &&
          (f['beneficiary'] ? r.beneficiary === f['beneficiary'] : true) &&
          (f['status'] ? r.status === f['status'] : true),
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'beneficiary':
              return a.beneficiary.localeCompare(b.beneficiary);
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

  override get(id: Id): Observable<IncentiveRule> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'INCENTIVE_RULE_NOT_FOUND', message: 'Incentive rule not found.' });
  }

  override create(payload: CreateIncentiveRulePayload): Observable<IncentiveRule> {
    if (
      this.rows.some(
        (r) =>
          r.status === 'ACTIVE' &&
          r.scopeType === payload.scopeType &&
          (r.scopeId ?? null) === (payload.scopeId ?? null) &&
          r.beneficiary === payload.beneficiary,
      )
    ) {
      return mockFail({
        status: 409,
        code: 'INCENTIVE_RULE_SCOPE_CONFLICT',
        message: 'An active incentive rule already covers this scope and beneficiary.',
      });
    }
    const row: IncentiveRule = {
      ...payload,
      id: fixtureId('irule', this.rows.length + 1),
      name: payload.name.trim(),
      scopeId: payload.scopeType === 'GLOBAL' ? undefined : payload.scopeId,
      scopeLabel: this.labelFor(payload.scopeType, payload.scopeId),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rows.unshift(row);
    return mockOk(row);
  }

  override update(id: Id, payload: UpdateIncentiveRulePayload): Observable<IncentiveRule> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({
        status: 404,
        code: 'INCENTIVE_RULE_NOT_FOUND',
        message: 'Incentive rule not found.',
      });
    }
    const updated: IncentiveRule = {
      ...this.rows[idx],
      ...payload,
      name: payload.name.trim(),
      scopeId: payload.scopeType === 'GLOBAL' ? undefined : payload.scopeId,
      scopeLabel: this.labelFor(payload.scopeType, payload.scopeId),
      version: this.rows[idx].version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<IncentiveRule> {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) {
      return mockFail({
        status: 404,
        code: 'INCENTIVE_RULE_NOT_FOUND',
        message: 'Incentive rule not found.',
      });
    }
    const updated: IncentiveRule = {
      ...this.rows[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.rows[idx] = updated;
    return mockOk(updated);
  }

  private labelFor(scopeType: IncentiveRule['scopeType'], scopeId?: Id): string {
    if (scopeType === 'GLOBAL') return RULE_SCOPE_TYPE_LABEL.GLOBAL;
    const existing = this.rows.find((r) => r.scopeType === scopeType && r.scopeId === scopeId);
    return existing?.scopeLabel ?? `${RULE_SCOPE_TYPE_LABEL[scopeType]} ${scopeId ?? ''}`.trim();
  }
}
