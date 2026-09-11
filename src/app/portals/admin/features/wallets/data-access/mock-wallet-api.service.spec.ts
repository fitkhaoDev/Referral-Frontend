import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockWalletApiService } from './mock-wallet-api.service';

const query = (over: Partial<Parameters<MockWalletApiService['listWallets']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockWalletApiService', () => {
  let api: MockWalletApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockWalletApiService] });
    api = TestBed.inject(MockWalletApiService);
  });

  it('lists wallets across all three owner types', async () => {
    const page = await firstValueFrom(api.listWallets(query({ size: 100 })));
    const types = new Set(page.items.map((w) => w.ownerType));
    expect(types).toEqual(new Set(['PARTNER', 'ORGANISATION', 'DOCTOR']));
    expect(page.totalItems).toBeGreaterThan(0);
  });

  it('filters wallets by owner type', async () => {
    const page = await firstValueFrom(
      api.listWallets(query({ size: 100, filters: { ownerType: 'ORGANISATION' } })),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((w) => w.ownerType === 'ORGANISATION')).toBe(true);
  });

  it('every wallet summary carries backend-provided balances (never derived here)', async () => {
    const page = await firstValueFrom(api.listWallets(query({ size: 100 })));
    expect(
      page.items.every(
        (w) =>
          typeof w.available.minorUnits === 'number' &&
          typeof w.pending.minorUnits === 'number' &&
          typeof w.outstandingRecovery.minorUnits === 'number' &&
          w.currency === 'INR',
      ),
    ).toBe(true);
  });

  it('returns a per-wallet ledger, newest first, with reversals as separate debit rows', async () => {
    const wallets = await firstValueFrom(api.listWallets(query({ size: 100 })));
    const withReversal = wallets.items.find((w) => w.reversed.minorUnits > 0)!;
    const ledger = await firstValueFrom(api.listTransactions(withReversal.id, query({ size: 100 })));

    expect(ledger.items.length).toBeGreaterThan(0);
    const sorted = [...ledger.items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    expect(ledger.items.map((t) => t.id)).toEqual(sorted.map((t) => t.id));

    const reversal = ledger.items.find((t) => t.type === 'REVERSAL');
    expect(reversal).toBeTruthy();
    expect(reversal!.direction).toBe('DEBIT');
  });

  it('filters ledger rows by type', async () => {
    const wallets = await firstValueFrom(api.listWallets(query({ size: 5 })));
    const first = wallets.items[0];
    const ledger = await firstValueFrom(
      api.listTransactions(first.id, query({ size: 100, filters: { type: 'WITHDRAWAL' } })),
    );
    expect(ledger.items.every((t) => t.type === 'WITHDRAWAL')).toBe(true);
  });

  it('404s for an unknown wallet', async () => {
    await expect(firstValueFrom(api.getWallet('wallet-999999'))).rejects.toMatchObject({
      code: 'WALLET_NOT_FOUND',
    });
  });
});
