import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockCommissionApiService } from './mock-commission-api.service';

const query = (over: Partial<Parameters<MockCommissionApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockCommissionApiService', () => {
  let api: MockCommissionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockCommissionApiService] });
    api = TestBed.inject(MockCommissionApiService);
  });

  it('every commission carries an immutable rule snapshot', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100 })));
    expect(page.totalItems).toBe(84);
    expect(
      page.items.every(
        (c) => !!c.ruleSnapshot.ruleId && typeof c.ruleSnapshot.ruleVersion === 'number',
      ),
    ).toBe(true);
  });

  it('reversed commissions carry a reason and reversedAt', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { status: 'REVERSED' } })),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((c) => !!c.reversalReason && !!c.reversedAt)).toBe(true);
  });

  it('filters by beneficiary type and incentive type', async () => {
    const doctorRenewals = await firstValueFrom(
      api.list(
        query({ size: 100, filters: { beneficiaryType: 'DOCTOR', incentiveType: 'RENEWAL' } }),
      ),
    );
    expect(
      doctorRenewals.items.every(
        (c) => c.beneficiaryType === 'DOCTOR' && c.ruleSnapshot.incentiveType === 'RENEWAL',
      ),
    ).toBe(true);
  });

  it('renewal snapshots carry the renewal number', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { incentiveType: 'RENEWAL' } })),
    );
    expect(page.items.every((c) => typeof c.ruleSnapshot.renewalNumber === 'number')).toBe(true);
  });
});
