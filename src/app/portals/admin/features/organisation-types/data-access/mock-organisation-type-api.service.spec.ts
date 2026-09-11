import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockOrganisationTypeApiService } from './mock-organisation-type-api.service';

const query = (over: Partial<Parameters<MockOrganisationTypeApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockOrganisationTypeApiService', () => {
  let api: MockOrganisationTypeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockOrganisationTypeApiService] });
    api = TestBed.inject(MockOrganisationTypeApiService);
  });

  it('lists all seeded types', async () => {
    const page = await firstValueFrom(api.list(query()));
    expect(page.totalItems).toBe(7);
  });

  it('filters by status', async () => {
    const page = await firstValueFrom(api.list(query({ filters: { status: 'INACTIVE' } })));
    expect(page.items.every((r) => r.status === 'INACTIVE')).toBe(true);
  });

  it('rejects a duplicate code', async () => {
    await expect(
      firstValueFrom(api.create({ name: 'Dupe', code: 'clinic', status: 'ACTIVE' })),
    ).rejects.toMatchObject({ status: 409, code: 'ORGANISATION_TYPE_CODE_TAKEN' });
  });

  it('creates and prepends a new type', async () => {
    const created = await firstValueFrom(
      api.create({ name: 'Wellness Retreat', code: 'wellness_retreat', status: 'ACTIVE' }),
    );
    expect(created.code).toBe('WELLNESS_RETREAT');
    const page = await firstValueFrom(api.list(query()));
    expect(page.items[0].id).toBe(created.id);
  });
});
