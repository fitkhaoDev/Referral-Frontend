import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockReferralApiService } from './mock-referral-api.service';

const query = (over: Partial<Parameters<MockReferralApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockReferralApiService', () => {
  let api: MockReferralApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockReferralApiService] });
    api = TestBed.inject(MockReferralApiService);
  });

  it('returns a stable large page of referral events', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100 })));
    expect(page.totalItems).toBe(72);
    expect(page.items[0].reference).toMatch(/^REF-2026-\d{6}$/);
  });

  it('non-earning events carry no commission and status NONE', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { eventCode: 'PAYMENT_REFUNDED' } })),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((r) => r.commissionStatus === 'NONE' && !r.commissionAmount)).toBe(true);
  });

  it('filters by commission status', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { commissionStatus: 'REVERSED' } })),
    );
    expect(page.items.every((r) => r.commissionStatus === 'REVERSED')).toBe(true);
  });

  it('filters by an inclusive occurredAt date range', async () => {
    const all = await firstValueFrom(api.list(query({ size: 100 })));
    const dates = all.items.map((r) => r.occurredAt.slice(0, 10)).sort();
    const from = dates[10];
    const to = dates[dates.length - 10];
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { fromDate: from, toDate: to } })),
    );
    expect(page.items.every((r) => r.occurredAt.slice(0, 10) >= from && r.occurredAt.slice(0, 10) <= to)).toBe(
      true,
    );
    expect(page.totalItems).toBeLessThan(72);
  });

  it('filters organisational referrals and exposes the referring member', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { partnerCategory: 'ORGANISATION' } })),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((r) => !!r.organisationId)).toBe(true);
    expect(page.items.some((r) => !!r.referringMemberName)).toBe(true);
  });
});
