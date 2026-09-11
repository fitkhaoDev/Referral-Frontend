import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { money } from '@core/models/money.model';
import { ORGANISATION_MEMBER_SEED, ORGANISATION_SEED } from '../../_fixtures/organisation-catalog';
import { Referral, ReferralCommissionStatus } from '../models/referral.model';
import { ReferralApi } from './referral-api.abstract';

const NOW = Date.now();
const isoAt = (daysAgo: number, hour: number): string =>
  new Date(NOW - daysAgo * 86_400_000 + hour * 3_600_000).toISOString();

const INDIVIDUAL_PARTNERS: Array<{ id: Id; name: string; code: string }> = [
  { id: 'partner-000001', name: 'Dr. John Doe', code: 'JOHNDO10' },
  { id: 'partner-000002', name: 'Dr. Anaya Mehta', code: 'ANAYAM21' },
  { id: 'partner-000003', name: 'Ritu Sharma', code: 'RITUSH32' },
  { id: 'partner-000005', name: 'Dr. Sana Iqbal', code: 'SANAIQ54' },
  { id: 'partner-000007', name: 'Priya Nair', code: 'PRIYAN76' },
];

const PLANS: Array<{ name: string; gross: number }> = [
  { name: 'Annual Wellness', gross: 12000 },
  { name: 'Half-Yearly Wellness', gross: 7000 },
  { name: 'Quarterly Wellness', gross: 4000 },
  { name: 'Monthly Wellness', gross: 1500 },
];

const EVENTS: Array<{ code: string; name: string; earns: boolean }> = [
  { code: 'REFERRAL_CREATED', name: 'Referral Created', earns: false },
  { code: 'COUPON_USED', name: 'Coupon Used', earns: false },
  { code: 'COUNSELLING_COMPLETED', name: 'Counselling Completed', earns: true },
  { code: 'SUBSCRIPTION_PURCHASED', name: 'Subscription Purchased', earns: true },
  { code: 'SUBSCRIPTION_RENEWED', name: 'Subscription Renewed', earns: true },
  { code: 'PAYMENT_COMPLETED', name: 'Payment Completed', earns: false },
  { code: 'PAYMENT_REFUNDED', name: 'Payment Refunded', earns: false },
];

const COMMISSION_STATUSES: ReferralCommissionStatus[] = [
  'AVAILABLE',
  'AVAILABLE',
  'PENDING',
  'AVAILABLE',
  'WITHDRAWN',
  'REVERSED',
];

/** Fixed representative commission amounts by event — NOT computed. */
const FIXTURE_COMMISSION: Record<string, number> = {
  COUNSELLING_COMPLETED: 100,
  SUBSCRIPTION_PURCHASED: 600,
  SUBSCRIPTION_RENEWED: 300,
};

function buildRows(): Referral[] {
  const rows: Referral[] = [];
  for (let i = 0; i < 72; i++) {
    const isOrg = i % 3 === 0;
    const event = EVENTS[i % EVENTS.length];
    const plan = PLANS[i % PLANS.length];
    const hasPlan = event.code === 'SUBSCRIPTION_PURCHASED' || event.code === 'SUBSCRIPTION_RENEWED';
    const discountApplied = hasPlan && i % 4 === 0 ? Math.round(plan.gross * 0.1) : 0;
    const commissionStatus: ReferralCommissionStatus = event.earns
      ? COMMISSION_STATUSES[i % COMMISSION_STATUSES.length]
      : 'NONE';

    const base: Referral = {
      id: fixtureId('referral', i + 1),
      reference: `REF-2026-${String(4000 + i).padStart(6, '0')}`,
      customerRef: `CUS-${String(8000 + ((i * 37) % 2000)).padStart(5, '0')}`,
      partnerCategory: isOrg ? 'ORGANISATION' : 'INDIVIDUAL',
      referralCode: isOrg
        ? ORGANISATION_SEED[i % ORGANISATION_SEED.length].referralCode
        : INDIVIDUAL_PARTNERS[i % INDIVIDUAL_PARTNERS.length].code,
      eventCode: event.code,
      eventName: event.name,
      plan: hasPlan ? plan.name : undefined,
      planAmount: hasPlan ? money(plan.gross) : undefined,
      customerDiscount: discountApplied ? money(discountApplied) : undefined,
      amountPayable: hasPlan ? money(plan.gross - discountApplied) : undefined,
      commissionAmount: event.earns ? money(FIXTURE_COMMISSION[event.code] ?? 0) : undefined,
      commissionStatus,
      occurredAt: isoAt(170 - i * 2, (i % 12) + 8),
      transactionRef: hasPlan ? `TXN-${String(500000 + i * 7).padStart(8, '0')}` : undefined,
    };

    if (isOrg) {
      const org = ORGANISATION_SEED[i % ORGANISATION_SEED.length];
      const orgMembers = ORGANISATION_MEMBER_SEED.filter((m) => m.organisationId === org.id);
      const member = orgMembers[i % Math.max(1, orgMembers.length)];
      rows.push({
        ...base,
        organisationId: org.id,
        organisationName: org.name,
        referringMemberId: member?.id,
        referringMemberName: member?.name,
      });
    } else {
      const p = INDIVIDUAL_PARTNERS[i % INDIVIDUAL_PARTNERS.length];
      rows.push({ ...base, partnerId: p.id, partnerName: p.name });
    }
  }
  return rows;
}

/** Development-only in-memory {@link ReferralApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockReferralApiService extends ReferralApi {
  private readonly rows = buildRows();

  override list(query: PageQuery): Observable<Page<Referral>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) =>
          `${r.reference} ${r.customerRef} ${r.referralCode} ${r.transactionRef ?? ''} ${
            r.partnerName ?? ''
          } ${r.organisationName ?? ''} ${r.referringMemberName ?? ''}`,
        filter: (r, f) => {
          if (f['partnerCategory'] && r.partnerCategory !== f['partnerCategory']) return false;
          if (f['organisationId'] && r.organisationId !== f['organisationId']) return false;
          if (f['referringMemberId'] && r.referringMemberId !== f['referringMemberId']) return false;
          if (f['eventCode'] && r.eventCode !== f['eventCode']) return false;
          if (f['commissionStatus'] && r.commissionStatus !== f['commissionStatus']) return false;
          if (f['plan'] && r.plan !== f['plan']) return false;
          if (f['fromDate'] && r.occurredAt.slice(0, 10) < String(f['fromDate'])) return false;
          if (f['toDate'] && r.occurredAt.slice(0, 10) > String(f['toDate'])) return false;
          return true;
        },
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'occurredAt':
              return a.occurredAt.localeCompare(b.occurredAt);
            case 'eventName':
              return a.eventName.localeCompare(b.eventName);
            case 'commissionAmount':
              return (a.commissionAmount?.minorUnits ?? 0) - (b.commissionAmount?.minorUnits ?? 0);
            case 'commissionStatus':
              return a.commissionStatus.localeCompare(b.commissionStatus);
            default:
              return a.reference.localeCompare(b.reference);
          }
        },
      }),
    );
  }

  override get(id: Id): Observable<Referral> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'REFERRAL_NOT_FOUND', message: 'Referral not found.' });
  }
}
