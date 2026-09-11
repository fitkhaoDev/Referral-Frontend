import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fixtureId, mockFail, mockOk, paginate } from '@core/data-access/mock/mock-http.util';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { money } from '@core/models/money.model';
import { ORGANISATION_MEMBER_SEED, ORGANISATION_SEED } from '../../_fixtures/organisation-catalog';
import {
  WalletOwnerType,
  WalletSummary,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../models/wallet.model';
import { WalletApi } from './wallet-api.abstract';

const NOW = Date.now();
const isoAt = (daysAgo: number, hour: number): string =>
  new Date(NOW - daysAgo * 86_400_000 + hour * 3_600_000).toISOString();

type TxnExtras = { -readonly [K in keyof WalletTransaction]?: WalletTransaction[K] };

/**
 * Authored wallet balances. IMPORTANT: these figures are hand-authored, NOT summed
 * from the ledger below. The real backend is the sole authority on every balance;
 * this mock only mirrors that a summary arrives ready-computed. Do not "fix" a
 * wallet by making its numbers add up to its transactions.
 */
interface WalletSeed {
  readonly ownerType: WalletOwnerType;
  readonly ownerId: Id;
  readonly ownerName: string;
  readonly ownerRef: string;
  readonly totalEarned: number;
  readonly available: number;
  readonly pending: number;
  readonly withdrawn: number;
  readonly reversed: number;
  readonly outstandingRecovery: number;
  readonly txnCount: number;
}

const INDIVIDUAL_PARTNER_SEEDS: WalletSeed[] = [
  {
    ownerType: 'PARTNER',
    ownerId: 'partner-000001',
    ownerName: 'Dr. John Doe',
    ownerRef: 'FK-PTR-000001',
    totalEarned: 48200,
    available: 21600,
    pending: 3800,
    withdrawn: 22800,
    reversed: 1200,
    outstandingRecovery: 0,
    txnCount: 22,
  },
  {
    ownerType: 'PARTNER',
    ownerId: 'partner-000002',
    ownerName: 'Dr. Anaya Mehta',
    ownerRef: 'FK-PTR-000002',
    totalEarned: 15400,
    available: 9200,
    pending: 1500,
    withdrawn: 4700,
    reversed: 0,
    outstandingRecovery: 0,
    txnCount: 12,
  },
  {
    ownerType: 'PARTNER',
    ownerId: 'partner-000003',
    ownerName: 'Ritu Sharma',
    ownerRef: 'FK-PTR-000003',
    totalEarned: 6100,
    available: 0,
    pending: 900,
    withdrawn: 4600,
    reversed: 600,
    outstandingRecovery: 600,
    txnCount: 9,
  },
  {
    ownerType: 'PARTNER',
    ownerId: 'partner-000004',
    ownerName: 'Dr. Sana Iqbal',
    ownerRef: 'FK-PTR-000004',
    totalEarned: 2700,
    available: 2700,
    pending: 0,
    withdrawn: 0,
    reversed: 0,
    outstandingRecovery: 0,
    txnCount: 5,
  },
];

const ORGANISATION_SEEDS: WalletSeed[] = ORGANISATION_SEED.map((org, i) => ({
  ownerType: 'ORGANISATION' as const,
  ownerId: org.id,
  ownerName: org.name,
  ownerRef: org.partnerId,
  totalEarned: [86400, 52000, 33500, 18900, 4200][i] ?? 4000,
  available: [31200, 19400, 8700, 5100, 0][i] ?? 0,
  pending: [6400, 2600, 1800, 0, 0][i] ?? 0,
  withdrawn: [46000, 30000, 21000, 13800, 4200][i] ?? 0,
  reversed: [2800, 0, 2000, 0, 0][i] ?? 0,
  outstandingRecovery: [0, 0, 2000, 0, 0][i] ?? 0,
  txnCount: [26, 20, 16, 11, 6][i] ?? 6,
}));

const DOCTOR_SEEDS: WalletSeed[] = ORGANISATION_MEMBER_SEED.filter((_, i) => i % 3 === 0).map(
  (member, i) => ({
    ownerType: 'DOCTOR' as const,
    ownerId: member.id,
    ownerName: member.name,
    ownerRef: `FK-DOC-${String(i + 1).padStart(6, '0')}`,
    totalEarned: [12800, 7400, 3100, 900][i] ?? 900,
    available: [5200, 3400, 1200, 900][i] ?? 0,
    pending: [1400, 800, 0, 0][i] ?? 0,
    withdrawn: [6200, 3200, 1900, 0][i] ?? 0,
    reversed: [0, 400, 0, 0][i] ?? 0,
    outstandingRecovery: [0, 400, 0, 0][i] ?? 0,
    txnCount: [15, 10, 7, 4][i] ?? 4,
  }),
);

const WALLET_SEEDS: WalletSeed[] = [
  ...INDIVIDUAL_PARTNER_SEEDS,
  ...ORGANISATION_SEEDS,
  ...DOCTOR_SEEDS,
];

function buildSummary(seed: WalletSeed, index: number): WalletSummary {
  return {
    id: fixtureId('wallet', index + 1),
    ownerType: seed.ownerType,
    ownerId: seed.ownerId,
    ownerName: seed.ownerName,
    ownerRef: seed.ownerRef,
    currency: 'INR',
    totalEarned: money(seed.totalEarned),
    available: money(seed.available),
    pending: money(seed.pending),
    withdrawn: money(seed.withdrawn),
    reversed: money(seed.reversed),
    outstandingRecovery: money(seed.outstandingRecovery),
    lastActivityAt: isoAt(2 + index, 11),
  };
}

const SUMMARIES: WalletSummary[] = WALLET_SEEDS.map(buildSummary);

const INCENTIVE_CYCLE: Array<{
  type: WalletTransactionType;
  eventName: string;
  amount: number;
  rate: string;
  eligible: number;
}> = [
  {
    type: 'COUNSELLING_INCENTIVE',
    eventName: 'Counselling Completed',
    amount: 100,
    rate: '₹100 fixed',
    eligible: 0,
  },
  {
    type: 'FIRST_PURCHASE_INCENTIVE',
    eventName: 'Subscription Purchased',
    amount: 600,
    rate: '5%',
    eligible: 12000,
  },
  {
    type: 'RENEWAL_INCENTIVE',
    eventName: 'Subscription Renewed',
    amount: 360,
    rate: '3%',
    eligible: 12000,
  },
];

function ledgerFor(seed: WalletSeed, walletIndex: number): WalletTransaction[] {
  const rows: WalletTransaction[] = [];
  for (let i = 0; i < seed.txnCount; i++) {
    const daysAgo = 4 + i * 7 + walletIndex;
    const ordinal = i + 1;
    const ref = `WTX-${String(walletIndex + 1).padStart(3, '0')}-${String(ordinal).padStart(4, '0')}`;
    const customerRef = `CUS-${String(8000 + ((walletIndex * 53 + i * 17) % 2000)).padStart(5, '0')}`;

    // A withdrawal every 6th row (if the wallet has ever withdrawn); a reversal +
    // recovery pair near the middle when the wallet has a reversed balance.
    const isWithdrawal = seed.withdrawn > 0 && i > 0 && i % 6 === 0;
    const isReversal = seed.reversed > 0 && i === Math.floor(seed.txnCount / 2);
    const isRecovery =
      seed.outstandingRecovery === 0 && seed.reversed > 0 && i === Math.floor(seed.txnCount / 2) + 1;

    let type: WalletTransactionType;
    let direction: 'CREDIT' | 'DEBIT';
    let amountMajor: number;
    let status: WalletTransactionStatus;
    const partial: TxnExtras = {};

    if (isWithdrawal) {
      type = 'WITHDRAWAL';
      direction = 'DEBIT';
      amountMajor = 4000;
      status = 'PAID';
      partial.note = 'Bank transfer to registered account';
    } else if (isReversal) {
      type = 'REVERSAL';
      direction = 'DEBIT';
      amountMajor = seed.reversed > 600 ? 600 : seed.reversed;
      status = 'REVERSED';
      partial.customerRef = customerRef;
      partial.commissionId = fixtureId('commission', walletIndex + i + 1);
      partial.commissionRef = `COM-2026-${String(3000 + walletIndex * 4 + i).padStart(6, '0')}`;
      partial.note = 'Subscription refunded — commission clawed back';
    } else if (isRecovery) {
      type = 'RECOVERY';
      direction = 'DEBIT';
      amountMajor = seed.reversed > 600 ? 600 : seed.reversed;
      status = 'RECOVERED';
      partial.customerRef = customerRef;
      partial.note = 'Recovered from a later incentive against an earlier reversal';
    } else {
      const inc = INCENTIVE_CYCLE[i % INCENTIVE_CYCLE.length];
      type = inc.type;
      direction = 'CREDIT';
      amountMajor = inc.amount;
      status = i < 2 ? 'PENDING' : 'AVAILABLE';
      partial.customerRef = customerRef;
      partial.eventName = inc.eventName;
      partial.incentiveRate = inc.rate;
      if (inc.eligible > 0) partial.eligibleAmount = money(inc.eligible);
      partial.commissionId = fixtureId('commission', walletIndex + i + 1);
      partial.commissionRef = `COM-2026-${String(3000 + walletIndex * 4 + i).padStart(6, '0')}`;
    }

    if (seed.ownerType === 'DOCTOR') {
      const member = ORGANISATION_MEMBER_SEED.find((m) => m.id === seed.ownerId);
      if (member) {
        const org = ORGANISATION_SEED.find((o) => o.id === member.organisationId);
        partial.organisationName = org?.name;
        partial.memberName = member.name;
      }
    } else if (seed.ownerType === 'ORGANISATION') {
      partial.organisationName = seed.ownerName;
    }

    rows.push({
      id: fixtureId(`wtx-${walletIndex + 1}`, ordinal),
      reference: ref,
      type,
      direction,
      amount: money(amountMajor),
      status,
      occurredAt: isoAt(daysAgo, (i % 10) + 8),
      ...partial,
    });
  }
  // Newest first.
  return rows.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

const LEDGERS = new Map<Id, WalletTransaction[]>(
  SUMMARIES.map((summary, i) => [summary.id, ledgerFor(WALLET_SEEDS[i], i)]),
);

/** Development-only in-memory {@link WalletApi}. Fixtures only — no financial logic. */
@Injectable()
export class MockWalletApiService extends WalletApi {
  override listWallets(query: PageQuery): Observable<Page<WalletSummary>> {
    return mockOk(
      paginate(SUMMARIES, query, {
        searchable: (w) => `${w.ownerName} ${w.ownerRef}`,
        filter: (w, f) => {
          if (f['ownerType'] && w.ownerType !== f['ownerType']) return false;
          return true;
        },
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'available':
              return a.available.minorUnits - b.available.minorUnits;
            case 'pending':
              return a.pending.minorUnits - b.pending.minorUnits;
            case 'totalEarned':
              return a.totalEarned.minorUnits - b.totalEarned.minorUnits;
            case 'lastActivityAt':
              return a.lastActivityAt.localeCompare(b.lastActivityAt);
            default:
              return a.ownerName.localeCompare(b.ownerName);
          }
        },
      }),
    );
  }

  override getWallet(id: Id): Observable<WalletSummary> {
    const summary = SUMMARIES.find((w) => w.id === id);
    return summary
      ? mockOk(summary)
      : mockFail({ status: 404, code: 'WALLET_NOT_FOUND', message: 'Wallet not found.' });
  }

  override listTransactions(walletId: Id, query: PageQuery): Observable<Page<WalletTransaction>> {
    const ledger = LEDGERS.get(walletId);
    if (!ledger) {
      return mockFail({ status: 404, code: 'WALLET_NOT_FOUND', message: 'Wallet not found.' });
    }
    return mockOk(
      paginate(ledger, query, {
        searchable: (t) =>
          `${t.reference} ${t.customerRef ?? ''} ${t.commissionRef ?? ''} ${t.eventName ?? ''}`,
        filter: (t, f) => {
          if (f['type'] && t.type !== f['type']) return false;
          if (f['status'] && t.status !== f['status']) return false;
          if (f['fromDate'] && t.occurredAt.slice(0, 10) < String(f['fromDate'])) return false;
          if (f['toDate'] && t.occurredAt.slice(0, 10) > String(f['toDate'])) return false;
          return true;
        },
        comparator: (sort) => (a, b) => {
          switch (sort.field) {
            case 'amount':
              return a.amount.minorUnits - b.amount.minorUnits;
            case 'type':
              return a.type.localeCompare(b.type);
            case 'status':
              return a.status.localeCompare(b.status);
            default:
              return a.occurredAt.localeCompare(b.occurredAt);
          }
        },
      }),
    );
  }
}
