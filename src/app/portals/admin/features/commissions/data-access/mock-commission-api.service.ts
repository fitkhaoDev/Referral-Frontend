import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { money } from '@core/models/money.model';
import { ORGANISATION_MEMBER_SEED, ORGANISATION_SEED } from '../../_fixtures/organisation-catalog';
import {
  Commission,
  CommissionRuleSnapshot,
  CommissionStatus,
  IncentiveType,
} from '../models/commission.model';
import { CommissionApi } from './commission-api.abstract';

const NOW = Date.now();
const isoAt = (daysAgo: number, hour: number): string =>
  new Date(NOW - daysAgo * 86_400_000 + hour * 3_600_000).toISOString();

const INDIVIDUAL_PARTNERS = [
  { id: 'partner-000001', name: 'Dr. John Doe', code: 'JOHNDO10', ruleId: 'irule-000001', ruleVersion: 4 },
  { id: 'partner-000002', name: 'Dr. Anaya Mehta', code: 'ANAYAM21', ruleId: 'irule-000002', ruleVersion: 2 },
  { id: 'partner-000003', name: 'Ritu Sharma', code: 'RITUSH32', ruleId: 'irule-000003', ruleVersion: 1 },
  { id: 'partner-000004', name: 'Dr. Sana Iqbal', code: 'SANAIQ54', ruleId: 'irule-000004', ruleVersion: 1 },
];

const EVENT_TO_INCENTIVE: Array<{ code: string; name: string; incentiveType: IncentiveType }> = [
  { code: 'COUNSELLING_COMPLETED', name: 'Counselling Completed', incentiveType: 'COUNSELLING' },
  { code: 'SUBSCRIPTION_PURCHASED', name: 'Subscription Purchased', incentiveType: 'FIRST_PURCHASE' },
  { code: 'SUBSCRIPTION_RENEWED', name: 'Subscription Renewed', incentiveType: 'RENEWAL' },
];

const STATUS_CYCLE: CommissionStatus[] = [
  'AVAILABLE',
  'AVAILABLE',
  'PENDING',
  'AVAILABLE',
  'WITHDRAWN',
  'REVERSED',
  'AVAILABLE',
  'CANCELLED',
];

/** Fixed representative figures — NOT computed. */
const ELIGIBLE_BY_TYPE: Record<IncentiveType, number> = {
  COUNSELLING: 0,
  FIRST_PURCHASE: 12000,
  RENEWAL: 12000,
};
const CALCULATED_BY_TYPE: Record<IncentiveType, number> = {
  COUNSELLING: 100,
  FIRST_PURCHASE: 600,
  RENEWAL: 360,
};

function snapshot(
  incentiveType: IncentiveType,
  ruleId: Id,
  ruleVersion: number,
  i: number,
): CommissionRuleSnapshot {
  const base: CommissionRuleSnapshot = {
    ruleId,
    ruleVersion,
    incentiveType,
    componentKind: incentiveType === 'COUNSELLING' ? 'FIXED' : 'PERCENT',
    snapshotAt: isoAt(170 - i * 2, 6),
  };
  if (incentiveType === 'COUNSELLING') {
    return { ...base, fixedAmount: money(100) };
  }
  return {
    ...base,
    percent: incentiveType === 'FIRST_PURCHASE' ? 5 : 3,
    eligibleAmount: money(ELIGIBLE_BY_TYPE[incentiveType]),
    renewalNumber: incentiveType === 'RENEWAL' ? ((i % 3) + 1) : undefined,
  };
}

type CommissionExtras = { -readonly [K in keyof Commission]?: Commission[K] };

function buildRows(): Commission[] {
  const rows: Commission[] = [];
  for (let i = 0; i < 84; i++) {
    const isOrg = i % 3 === 0;
    const evt = EVENT_TO_INCENTIVE[i % EVENT_TO_INCENTIVE.length];
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];

    let ruleId: Id;
    let ruleVersion: number;
    let beneficiaryType: Commission['beneficiaryType'];
    const partial: CommissionExtras = {};

    if (isOrg) {
      const org = ORGANISATION_SEED[i % ORGANISATION_SEED.length];
      const members = ORGANISATION_MEMBER_SEED.filter((m) => m.organisationId === org.id);
      const member = members[i % Math.max(1, members.length)];
      const asDoctor = i % 2 === 0;
      beneficiaryType = asDoctor ? 'DOCTOR' : 'ORGANISATION';
      ruleId = asDoctor ? 'irule-000006' : 'irule-000005';
      ruleVersion = asDoctor ? 1 : 2;
      partial.organisationId = org.id;
      partial.organisationName = org.name;
      partial.referralCode = org.referralCode;
      if (asDoctor && member) {
        partial.memberId = member.id;
        partial.memberName = member.name;
      }
    } else {
      const p = INDIVIDUAL_PARTNERS[i % INDIVIDUAL_PARTNERS.length];
      beneficiaryType = 'PARTNER';
      ruleId = p.ruleId;
      ruleVersion = p.ruleVersion;
      partial.partnerId = p.id;
      partial.partnerName = p.name;
      partial.referralCode = p.code;
    }

    const reversed = status === 'REVERSED';
    rows.push({
      id: fixtureId('commission', i + 1),
      reference: `COM-2026-${String(3000 + i).padStart(6, '0')}`,
      beneficiaryType,
      customerRef: `CUS-${String(8000 + ((i * 41) % 2000)).padStart(5, '0')}`,
      referralCode: partial.referralCode!,
      eventCode: evt.code,
      eventName: evt.name,
      calculatedAmount: money(CALCULATED_BY_TYPE[evt.incentiveType]),
      status,
      ruleSnapshot: snapshot(evt.incentiveType, ruleId, ruleVersion, i),
      transactionRef: `TXN-${String(600000 + i * 9).padStart(8, '0')}`,
      occurredAt: isoAt(170 - i * 2, (i % 12) + 8),
      availableAt: status === 'PENDING' ? undefined : isoAt(168 - i * 2, 10),
      reversedAt: reversed ? isoAt(20 + (i % 30), 12) : undefined,
      reversalReason: reversed
        ? ['Subscription refunded', 'Payment failed', 'Subscription cancelled'][i % 3]
        : undefined,
      ...partial,
    });
  }
  return rows;
}

/** Development-only in-memory {@link CommissionApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockCommissionApiService extends CommissionApi {
  private readonly rows = buildRows();

  override list(query: PageQuery): Observable<Page<Commission>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) =>
          `${r.reference} ${r.customerRef} ${r.referralCode} ${r.transactionRef ?? ''} ${
            r.partnerName ?? ''
          } ${r.organisationName ?? ''} ${r.memberName ?? ''}`,
        filter: (r, f) => {
          if (f['status'] && r.status !== f['status']) return false;
          if (f['beneficiaryType'] && r.beneficiaryType !== f['beneficiaryType']) return false;
          if (f['incentiveType'] && r.ruleSnapshot.incentiveType !== f['incentiveType']) return false;
          if (f['organisationId'] && r.organisationId !== f['organisationId']) return false;
          if (f['eventCode'] && r.eventCode !== f['eventCode']) return false;
          if (f['fromDate'] && r.occurredAt.slice(0, 10) < String(f['fromDate'])) return false;
          if (f['toDate'] && r.occurredAt.slice(0, 10) > String(f['toDate'])) return false;
          return true;
        },
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'occurredAt':
              return a.occurredAt.localeCompare(b.occurredAt);
            case 'calculatedAmount':
              return a.calculatedAmount.minorUnits - b.calculatedAmount.minorUnits;
            case 'status':
              return a.status.localeCompare(b.status);
            default:
              return a.reference.localeCompare(b.reference);
          }
        },
      }),
    );
  }

  override get(id: Id): Observable<Commission> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'COMMISSION_NOT_FOUND', message: 'Commission not found.' });
  }
}
