import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { money } from '@core/models/money.model';
import { MockDiscountRuleApiService } from './mock-discount-rule-api.service';

const query = (over: Partial<Parameters<MockDiscountRuleApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockDiscountRuleApiService', () => {
  let api: MockDiscountRuleApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockDiscountRuleApiService] });
    api = TestBed.inject(MockDiscountRuleApiService);
  });

  it('lists seeded rules', async () => {
    const page = await firstValueFrom(api.list(query()));
    expect(page.totalItems).toBe(5);
  });

  it('filters by scope type', async () => {
    const page = await firstValueFrom(api.list(query({ filters: { scopeType: 'ORGANISATION' } })));
    expect(page.items.every((r) => r.scopeType === 'ORGANISATION')).toBe(true);
  });

  it('rejects a second active rule for the same scope', async () => {
    await expect(
      firstValueFrom(
        api.create({
          name: 'Another global',
          scopeType: 'GLOBAL',
          discount: { kind: 'PERCENT', percent: 5 },
          status: 'ACTIVE',
          effectiveFrom: '2026-09-01',
        }),
      ),
    ).rejects.toMatchObject({ status: 409, code: 'DISCOUNT_RULE_SCOPE_CONFLICT' });
  });

  it('bumps the version on update, keeping the id', async () => {
    const rule = (await firstValueFrom(api.list(query()))).items.find((r) => r.name.includes('Apollo'))!;
    const before = rule.version;
    const updated = await firstValueFrom(
      api.update(rule.id, {
        name: rule.name,
        scopeType: rule.scopeType,
        scopeId: rule.scopeId,
        discount: { kind: 'FIXED', amount: money(2000) },
        status: rule.status,
        effectiveFrom: rule.effectiveFrom,
      }),
    );
    expect(updated.id).toBe(rule.id);
    expect(updated.version).toBe(before + 1);
    expect(updated.discount).toEqual({ kind: 'FIXED', amount: money(2000) });
  });
});
