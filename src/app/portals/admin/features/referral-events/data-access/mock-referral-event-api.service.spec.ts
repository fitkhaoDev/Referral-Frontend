import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockReferralEventApiService } from './mock-referral-event-api.service';

const query = (over: Partial<Parameters<MockReferralEventApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockReferralEventApiService', () => {
  let api: MockReferralEventApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockReferralEventApiService] });
    api = TestBed.inject(MockReferralEventApiService);
  });

  it('defaults to ascending sortOrder', async () => {
    const page = await firstValueFrom(api.list(query()));
    expect(page.items[0].code).toBe('REFERRAL_CREATED');
    expect(page.items.map((r) => r.sortOrder)).toEqual(
      [...page.items.map((r) => r.sortOrder)].sort((a, b) => a - b),
    );
  });

  it('filters by system flag', async () => {
    const custom = await firstValueFrom(api.list(query({ filters: { system: 'false' } })));
    expect(custom.items.every((r) => r.system === false)).toBe(true);
    expect(custom.items).toHaveLength(1);
  });

  it('rejects a duplicate code', async () => {
    await expect(
      firstValueFrom(
        api.create({ name: 'Dupe', code: 'payment_completed', status: 'ACTIVE', sortOrder: 99 }),
      ),
    ).rejects.toMatchObject({ status: 409, code: 'REFERRAL_EVENT_CODE_TAKEN' });
  });

  it('creates custom (non-system) events', async () => {
    const created = await firstValueFrom(
      api.create({ name: 'Trial Started', code: 'trial_started', status: 'ACTIVE', sortOrder: 5 }),
    );
    expect(created.system).toBe(false);
    expect(created.code).toBe('TRIAL_STARTED');
  });
});
