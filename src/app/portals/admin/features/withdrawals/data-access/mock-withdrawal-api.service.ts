import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { money } from '@core/models/money.model';
import { ORGANISATION_MEMBER_SEED, ORGANISATION_SEED } from '../../_fixtures/organisation-catalog';
import {
  MarkWithdrawalFailedPayload,
  MarkWithdrawalPaidPayload,
  RejectWithdrawalPayload,
  Withdrawal,
  WithdrawalAction,
  WithdrawalBeneficiaryType,
  WithdrawalPayoutMethod,
  WithdrawalPolicy,
  WithdrawalStatus,
} from '../models/withdrawal.model';
import { WithdrawalApi } from './withdrawal-api.abstract';

const NOW = Date.now();
const isoAt = (daysAgo: number, hour: number): string =>
  new Date(NOW - daysAgo * 86_400_000 + hour * 3_600_000).toISOString();

type WithdrawalExtras = { -readonly [K in keyof Withdrawal]?: Withdrawal[K] };

/**
 * ASSUMED transition graph for the dev mock. The real backend is authoritative and
 * returns `allowedActions` per withdrawal; this mirror keeps the mock self-consistent.
 * (Flagged to the product team — confirm before backend implementation.)
 */
const ACTIONS_FOR: Record<WithdrawalStatus, WithdrawalAction[]> = {
  REQUESTED: ['APPROVE', 'REJECT'],
  APPROVED: ['MARK_PROCESSING'],
  PROCESSING: ['MARK_PAID', 'MARK_FAILED'],
  FAILED: ['MARK_PROCESSING'],
  PAID: [],
  REJECTED: [],
  CANCELLED: [],
};

const POLICY: WithdrawalPolicy = {
  minAmount: money(4000),
  maxRequestsPerCalendarMonth: 2,
  currency: 'INR',
  note: 'Minimum ₹4,000 per request; at most 2 requests per calendar month. The backend enforces both at request time.',
};

const INDIVIDUAL_PARTNERS = [
  { id: 'partner-000001', name: 'Dr. John Doe', wallet: 'wallet-000001' },
  { id: 'partner-000002', name: 'Dr. Anaya Mehta', wallet: 'wallet-000002' },
  { id: 'partner-000003', name: 'Ritu Sharma', wallet: 'wallet-000003' },
  { id: 'partner-000004', name: 'Dr. Sana Iqbal', wallet: 'wallet-000004' },
];

const STATUS_CYCLE: WithdrawalStatus[] = [
  'REQUESTED',
  'APPROVED',
  'PROCESSING',
  'PAID',
  'PAID',
  'FAILED',
  'REJECTED',
  'CANCELLED',
  'REQUESTED',
  'PAID',
];

const AMOUNT_CYCLE = [4000, 6000, 8000, 12000, 5000, 9000, 15000];

function payoutFor(i: number): { method: WithdrawalPayoutMethod; destination: string } {
  return i % 2 === 0
    ? { method: 'BANK_TRANSFER', destination: ['HDFC ••••4821', 'ICICI ••••7290', 'SBI ••••1043'][i % 3] }
    : { method: 'UPI', destination: ['ritu@okhdfcbank', 'anaya.m@okaxis', 'clinic@okicici'][i % 3] };
}

function lifecycleFor(status: WithdrawalStatus, i: number): WithdrawalExtras {
  const requestedDaysAgo = 60 - i * 2;
  const extras: WithdrawalExtras = { requestedAt: isoAt(requestedDaysAgo, 9) };
  if (status === 'CANCELLED') {
    extras.cancelledAt = isoAt(requestedDaysAgo - 1, 10);
    return extras;
  }
  if (status === 'REQUESTED') return extras;

  extras.decidedAt = isoAt(requestedDaysAgo - 1, 11);
  extras.decidedBy = ['A. Nair (Finance)', 'P. Rao (Finance)'][i % 2];
  if (status === 'REJECTED') {
    extras.rejectionReason = [
      'Bank account name mismatch — asked partner to re-verify.',
      'Duplicate of an earlier request this month.',
    ][i % 2];
    return extras;
  }

  extras.processingStartedAt = isoAt(requestedDaysAgo - 2, 12);
  if (status === 'PROCESSING') return extras;

  if (status === 'PAID') {
    extras.paidAt = isoAt(requestedDaysAgo - 3, 14);
    extras.paymentReference = `UTR${String(400000000000 + i * 137).slice(0, 12)}`;
    return extras;
  }
  if (status === 'FAILED') {
    extras.failedAt = isoAt(requestedDaysAgo - 3, 15);
    extras.failureReason = 'Beneficiary bank returned the transfer (account frozen).';
    return extras;
  }
  return extras;
}

function buildRows(): Withdrawal[] {
  const rows: Withdrawal[] = [];
  for (let i = 0; i < 24; i++) {
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const amount = AMOUNT_CYCLE[i % AMOUNT_CYCLE.length];
    const payout = payoutFor(i);
    const attribution: WithdrawalExtras = {};
    let beneficiaryType: WithdrawalBeneficiaryType;
    let walletId: Id;

    if (i % 3 === 0) {
      const org = ORGANISATION_SEED[i % ORGANISATION_SEED.length];
      beneficiaryType = 'ORGANISATION';
      walletId = org.id;
      attribution.organisationId = org.id;
      attribution.organisationName = org.name;
    } else if (i % 3 === 1) {
      const org = ORGANISATION_SEED[i % ORGANISATION_SEED.length];
      const members = ORGANISATION_MEMBER_SEED.filter((m) => m.organisationId === org.id);
      const member = members[i % Math.max(1, members.length)];
      beneficiaryType = 'DOCTOR';
      walletId = member?.id ?? org.id;
      attribution.organisationId = org.id;
      attribution.organisationName = org.name;
      attribution.memberId = member?.id;
      attribution.memberName = member?.name;
    } else {
      const p = INDIVIDUAL_PARTNERS[i % INDIVIDUAL_PARTNERS.length];
      beneficiaryType = 'PARTNER';
      walletId = p.wallet;
      attribution.partnerId = p.id;
      attribution.partnerName = p.name;
    }

    rows.push({
      id: fixtureId('withdrawal', i + 1),
      reference: `WDR-2026-${String(5000 + i).padStart(6, '0')}`,
      beneficiaryType,
      walletId,
      amount: money(amount),
      availableBalanceAtRequest: money(amount + 2000 + (i % 4) * 1500),
      status,
      allowedActions: ACTIONS_FOR[status],
      payoutMethod: payout.method,
      payoutDestination: payout.destination,
      requesterNote: i % 5 === 0 ? 'Please process before month end.' : undefined,
      ...attribution,
      ...lifecycleFor(status, i),
    } as Withdrawal);
  }
  return rows;
}

/** Development-only in-memory {@link WithdrawalApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockWithdrawalApiService extends WithdrawalApi {
  private rows = buildRows();

  override list(query: PageQuery): Observable<Page<Withdrawal>> {
    return mockOk(
      paginate(this.rows, query, {
        searchable: (r) =>
          `${r.reference} ${r.partnerName ?? ''} ${r.organisationName ?? ''} ${
            r.memberName ?? ''
          } ${r.paymentReference ?? ''}`,
        filter: (r, f) => {
          if (f['status'] && r.status !== f['status']) return false;
          if (f['beneficiaryType'] && r.beneficiaryType !== f['beneficiaryType']) return false;
          if (f['organisationId'] && r.organisationId !== f['organisationId']) return false;
          if (f['fromDate'] && r.requestedAt.slice(0, 10) < String(f['fromDate'])) return false;
          if (f['toDate'] && r.requestedAt.slice(0, 10) > String(f['toDate'])) return false;
          return true;
        },
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'amount':
              return a.amount.minorUnits - b.amount.minorUnits;
            case 'status':
              return a.status.localeCompare(b.status);
            case 'requestedAt':
              return a.requestedAt.localeCompare(b.requestedAt);
            default:
              return a.reference.localeCompare(b.reference);
          }
        },
      }),
    );
  }

  override get(id: Id): Observable<Withdrawal> {
    const row = this.rows.find((r) => r.id === id);
    return row
      ? mockOk(row)
      : mockFail({ status: 404, code: 'WITHDRAWAL_NOT_FOUND', message: 'Withdrawal not found.' });
  }

  override getPolicy(): Observable<WithdrawalPolicy> {
    return mockOk(POLICY);
  }

  override approve(id: Id): Observable<Withdrawal> {
    return this.transition(id, 'APPROVE', (r) => ({
      ...r,
      status: 'APPROVED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'You (Finance)',
    }));
  }

  override reject(id: Id, payload: RejectWithdrawalPayload): Observable<Withdrawal> {
    if (!payload.reason?.trim()) {
      return mockFail({
        status: 422,
        code: 'VALIDATION',
        message: 'A rejection reason is required.',
        fieldErrors: { reason: ['A rejection reason is required.'] },
      });
    }
    return this.transition(id, 'REJECT', (r) => ({
      ...r,
      status: 'REJECTED',
      decidedAt: new Date().toISOString(),
      decidedBy: 'You (Finance)',
      rejectionReason: payload.reason.trim(),
    }));
  }

  override markProcessing(id: Id): Observable<Withdrawal> {
    return this.transition(id, 'MARK_PROCESSING', (r) => ({
      ...r,
      status: 'PROCESSING',
      processingStartedAt: new Date().toISOString(),
      failedAt: undefined,
      failureReason: undefined,
    }));
  }

  override markPaid(id: Id, payload: MarkWithdrawalPaidPayload): Observable<Withdrawal> {
    if (!payload.paymentReference?.trim()) {
      return mockFail({
        status: 422,
        code: 'VALIDATION',
        message: 'A payment reference is required.',
        fieldErrors: { paymentReference: ['A payment reference is required.'] },
      });
    }
    return this.transition(id, 'MARK_PAID', (r) => ({
      ...r,
      status: 'PAID',
      paidAt: new Date().toISOString(),
      paymentReference: payload.paymentReference.trim(),
    }));
  }

  override markFailed(id: Id, payload: MarkWithdrawalFailedPayload): Observable<Withdrawal> {
    if (!payload.reason?.trim()) {
      return mockFail({
        status: 422,
        code: 'VALIDATION',
        message: 'A failure reason is required.',
        fieldErrors: { reason: ['A failure reason is required.'] },
      });
    }
    return this.transition(id, 'MARK_FAILED', (r) => ({
      ...r,
      status: 'FAILED',
      failedAt: new Date().toISOString(),
      failureReason: payload.reason.trim(),
    }));
  }

  private transition(
    id: Id,
    action: WithdrawalAction,
    mutate: (row: Withdrawal) => Withdrawal,
  ): Observable<Withdrawal> {
    const row = this.rows.find((r) => r.id === id);
    if (!row) {
      return mockFail({
        status: 404,
        code: 'WITHDRAWAL_NOT_FOUND',
        message: 'Withdrawal not found.',
      });
    }
    if (!ACTIONS_FOR[row.status].includes(action)) {
      return mockFail({
        status: 409,
        code: 'WITHDRAWAL_TRANSITION_NOT_ALLOWED',
        message: `This withdrawal is ${row.status.toLowerCase()} and cannot be changed that way.`,
      });
    }
    const next = mutate(row);
    const updated: Withdrawal = { ...next, allowedActions: ACTIONS_FOR[next.status] };
    this.rows = this.rows.map((r) => (r.id === id ? updated : r));
    return mockOk(updated);
  }
}
