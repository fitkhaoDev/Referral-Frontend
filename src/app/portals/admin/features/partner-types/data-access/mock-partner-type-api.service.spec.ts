import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockPartnerTypeApiService } from './mock-partner-type-api.service';

const q = (over: Partial<Parameters<MockPartnerTypeApiService['list']>[0]> = {}) => ({
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

  // ── list() ────────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('paginates and reports the correct totals', async () => {
      const page = await firstValueFrom(api.list(q({ size: 4 })));
      expect(page.items).toHaveLength(4);
      expect(page.totalItems).toBe(10);
      expect(page.totalPages).toBe(3);
    });

    it('page 1 contains the next slice', async () => {
      const p0 = await firstValueFrom(api.list(q({ size: 4 })));
      const p1 = await firstValueFrom(api.list(q({ size: 4, page: 1 })));
      const ids0 = p0.items.map((r) => r.id);
      const ids1 = p1.items.map((r) => r.id);
      expect(ids1.some((id) => ids0.includes(id))).toBe(false);
    });

    it('filters by ACTIVE status', async () => {
      const page = await firstValueFrom(api.list(q({ size: 100, filters: { status: 'ACTIVE' } })));
      expect(page.items.length).toBeGreaterThan(0);
      expect(page.items.every((r) => r.status === 'ACTIVE')).toBe(true);
    });

    it('filters by INACTIVE status', async () => {
      const page = await firstValueFrom(api.list(q({ filters: { status: 'INACTIVE' } })));
      expect(page.items.every((r) => r.status === 'INACTIVE')).toBe(true);
    });

    it('searches by name (case-insensitive)', async () => {
      const page = await firstValueFrom(api.list(q({ search: 'yoga' })));
      expect(page.items.map((r) => r.code)).toEqual(['YOGA_INSTRUCTOR']);
    });

    it('searches by code', async () => {
      const page = await firstValueFrom(api.list(q({ search: 'DOCTOR' })));
      expect(page.items.some((r) => r.code === 'DOCTOR')).toBe(true);
    });

    it('returns empty results for a non-matching search', async () => {
      const page = await firstValueFrom(api.list(q({ search: 'ZZZZZ_NO_MATCH' })));
      expect(page.items).toHaveLength(0);
      expect(page.totalItems).toBe(0);
    });

    it('sorts by name ascending', async () => {
      const page = await firstValueFrom(
        api.list(q({ size: 100, sort: [{ field: 'name', direction: 'asc' }] })),
      );
      const names = page.items.map((r) => r.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('sorts by name descending', async () => {
      const page = await firstValueFrom(
        api.list(q({ size: 100, sort: [{ field: 'name', direction: 'desc' }] })),
      );
      const names = page.items.map((r) => r.name);
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    });

    it('sorts by partnerCount ascending', async () => {
      const page = await firstValueFrom(
        api.list(q({ size: 100, sort: [{ field: 'partnerCount', direction: 'asc' }] })),
      );
      const counts = page.items.map((r) => r.partnerCount);
      expect(counts).toEqual([...counts].sort((a, b) => a - b));
    });

    it('sorts by code ascending', async () => {
      const page = await firstValueFrom(
        api.list(q({ size: 100, sort: [{ field: 'code', direction: 'asc' }] })),
      );
      const codes = page.items.map((r) => r.code);
      expect(codes).toEqual([...codes].sort((a, b) => a.localeCompare(b)));
    });

    it('returns page metadata reflecting actual query params', async () => {
      const page = await firstValueFrom(api.list(q({ page: 1, size: 3 })));
      expect(page.page).toBe(1);
      expect(page.size).toBe(3);
    });
  });

  // ── get() ─────────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('returns the correct partner type by id', async () => {
      const list = await firstValueFrom(api.list(q()));
      const target = list.items[0];
      const result = await firstValueFrom(api.get(target.id));
      expect(result.id).toBe(target.id);
      expect(result.name).toBe(target.name);
    });

    it('rejects with status 404 for an unknown id', async () => {
      await expect(firstValueFrom(api.get('unknown-id'))).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── create() ──────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a new type, uppercasing the code and placing it first', async () => {
      const created = await firstValueFrom(
        api.create({ name: 'Wellness Coach', code: 'wellness_coach', status: 'ACTIVE' }),
      );
      expect(created.code).toBe('WELLNESS_COACH');
      expect(created.partnerCount).toBe(0);
      const page = await firstValueFrom(api.list(q()));
      expect(page.items[0].id).toBe(created.id);
      expect(page.totalItems).toBe(11);
    });

    it('creates with INACTIVE status', async () => {
      const result = await firstValueFrom(
        api.create({ name: 'Inactive Type', code: 'INACTIVE_T', status: 'INACTIVE' }),
      );
      expect(result.status).toBe('INACTIVE');
    });

    it('trims name whitespace', async () => {
      const result = await firstValueFrom(
        api.create({ name: '  Trimmed  ', code: 'TRIMMED_T', status: 'ACTIVE' }),
      );
      expect(result.name).toBe('Trimmed');
    });

    it('stores an optional description', async () => {
      const result = await firstValueFrom(
        api.create({ name: 'Podiatrist', code: 'PODIATRIST', status: 'ACTIVE', description: 'Foot care' }),
      );
      expect(result.description).toBe('Foot care');
    });

    it('rejects with status 409 and fieldErrors.code on duplicate code', async () => {
      await expect(
        firstValueFrom(api.create({ name: 'Dupe', code: 'doctor', status: 'ACTIVE' })),
      ).rejects.toMatchObject({ status: 409, code: 'PARTNER_TYPE_CODE_TAKEN' });
    });

    it('duplicate check is case-insensitive', async () => {
      await expect(
        firstValueFrom(api.create({ name: 'Dup2', code: 'DOCTOR', status: 'ACTIVE' })),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  // ── update() ──────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('updates the name and description', async () => {
      const list = await firstValueFrom(api.list(q({ size: 1 })));
      const { id } = list.items[0];
      const result = await firstValueFrom(
        api.update(id, { name: 'Updated Name', status: 'ACTIVE', description: 'New desc' }),
      );
      expect(result.id).toBe(id);
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('New desc');
    });

    it('can deactivate a type via update', async () => {
      const list = await firstValueFrom(api.list(q({ filters: { status: 'ACTIVE' }, size: 5 })));
      const { id, name } = list.items[0];
      const result = await firstValueFrom(api.update(id, { name, status: 'INACTIVE' }));
      expect(result.status).toBe('INACTIVE');
    });

    it('preserves the code (immutable field)', async () => {
      const list = await firstValueFrom(api.list(q({ size: 1 })));
      const { id, code } = list.items[0];
      const result = await firstValueFrom(api.update(id, { name: 'Changed', status: 'ACTIVE' }));
      expect(result.code).toBe(code);
    });

    it('rejects with status 404 for an unknown id', async () => {
      await expect(
        firstValueFrom(api.update('no-such-id', { name: 'X', status: 'ACTIVE' })),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  // ── setStatus() ───────────────────────────────────────────────────────────────

  describe('setStatus()', () => {
    it('toggles without deleting — total count stays the same', async () => {
      const first = (await firstValueFrom(api.list(q()))).items[0];
      const updated = await firstValueFrom(api.setStatus(first.id, 'INACTIVE'));
      expect(updated.status).toBe('INACTIVE');
      expect((await firstValueFrom(api.list(q()))).totalItems).toBe(10);
    });

    it('reactivates an INACTIVE type', async () => {
      const list = await firstValueFrom(api.list(q({ filters: { status: 'INACTIVE' }, size: 5 })));
      const { id } = list.items[0];
      const result = await firstValueFrom(api.setStatus(id, 'ACTIVE'));
      expect(result.status).toBe('ACTIVE');
    });

    it('persists the status change in a subsequent get()', async () => {
      const list = await firstValueFrom(api.list(q({ filters: { status: 'ACTIVE' }, size: 5 })));
      const { id } = list.items[0];
      await firstValueFrom(api.setStatus(id, 'INACTIVE'));
      const after = await firstValueFrom(api.get(id));
      expect(after.status).toBe('INACTIVE');
    });

    it('rejects with status 404 for an unknown id', async () => {
      await expect(
        firstValueFrom(api.setStatus('no-such-id', 'INACTIVE')),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
