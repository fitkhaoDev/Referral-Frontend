import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockPartnerTypeApiService } from './mock-partner-type-api.service';

const query = (over: Partial<Parameters<MockPartnerTypeApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockPartnerTypeApiService', () => {
  let api: MockPartnerTypeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockPartnerTypeApiService] });
    api = TestBed.inject(MockPartnerTypeApiService);
  });

  it('paginates and reports the true total', async () => {
    const page = await firstValueFrom(api.list(query({ size: 4 })));
    expect(page.items).toHaveLength(4);
    expect(page.totalItems).toBe(10);
    expect(page.totalPages).toBe(3);
  });

  it('searches across name and code', async () => {
    const page = await firstValueFrom(api.list(query({ search: 'yoga' })));
    expect(page.items.map((r) => r.code)).toEqual(['YOGA_INSTRUCTOR']);
  });

  it('filters by status', async () => {
    const page = await firstValueFrom(api.list(query({ filters: { status: 'INACTIVE' } })));
    expect(page.items.every((r) => r.status === 'INACTIVE')).toBe(true);
  });

  it('rejects a duplicate code with 409 + field error', async () => {
    await expect(
      firstValueFrom(api.create({ name: 'Dupe', code: 'doctor', status: 'ACTIVE' })),
    ).rejects.toMatchObject({ status: 409, code: 'PARTNER_TYPE_CODE_TAKEN' });
  });

  it('creates a new type, uppercasing the code and putting it first', async () => {
    const created = await firstValueFrom(
      api.create({ name: 'Wellness Coach', code: 'wellness_coach', status: 'ACTIVE' }),
    );
    expect(created.code).toBe('WELLNESS_COACH');
    expect(created.partnerCount).toBe(0);
    const page = await firstValueFrom(api.list(query()));
    expect(page.items[0].id).toBe(created.id);
    expect(page.totalItems).toBe(11);
  });

  it('setStatus toggles without deleting', async () => {
    const first = (await firstValueFrom(api.list(query()))).items[0];
    const updated = await firstValueFrom(api.setStatus(first.id, 'INACTIVE'));
    expect(updated.status).toBe('INACTIVE');
    expect((await firstValueFrom(api.list(query()))).totalItems).toBe(10);
  });
});
