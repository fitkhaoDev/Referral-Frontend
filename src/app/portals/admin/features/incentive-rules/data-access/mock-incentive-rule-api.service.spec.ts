import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { money } from '@core/models/money.model';
import { MockIncentiveRuleApiService } from './mock-incentive-rule-api.service';

const query = (over: Partial<Parameters<MockIncentiveRuleApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockIncentiveRuleApiService', () => {
  let api: MockIncentiveRuleApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockIncentiveRuleApiService] });
    api = TestBed.inject(MockIncentiveRuleApiService);
  });

  it('seeds the spec example structures including a per-renewal tapering rule', async () => {
    const page = await firstValueFrom(api.list(query()));
    expect(page.totalItems).toBe(7);
    const trainer = page.items.find((r) => r.name.includes('Fitness Trainer'))!;
    expect(trainer.renewal.kind).toBe('PER_RENEWAL');
    expect(trainer.renewal.tiers?.map((t) => t.incentive.percent)).toEqual([3, 2, 1]);
    expect(trainer.renewal.beyondLastTier?.kind).toBe('NONE');
  });

  it('keeps organisation and doctor incentives as separate rules for the same organisation', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { scopeType: 'ORGANISATION' } })),
    );
    const apolloRules = page.items.filter((r) => r.scopeId === 'org-000001');
    expect(apolloRules.map((r) => r.beneficiary).sort()).toEqual(['DOCTOR', 'ORGANISATION']);
  });

  it('rejects a second active rule for the same scope + beneficiary', async () => {
    await expect(
      firstValueFrom(
        api.create({
          name: 'Duplicate doctor rule',
          scopeType: 'PARTNER_TYPE',
          scopeId: 'ptype-000001',
          beneficiary: 'PARTNER',
          counselling: { kind: 'NONE' },
          firstPurchase: { kind: 'PERCENT', percent: 5 },
          renewal: { kind: 'NONE' },
          status: 'ACTIVE',
          effectiveFrom: '2026-09-01',
        }),
      ),
    ).rejects.toMatchObject({ status: 409, code: 'INCENTIVE_RULE_SCOPE_CONFLICT' });
  });

  it('bumps version on update and preserves the renewal structure', async () => {
    const rule = (await firstValueFrom(api.list(query()))).items.find((r) =>
      r.name.includes('Physiotherapist'),
    )!;
    const updated = await firstValueFrom(
      api.update(rule.id, {
        name: rule.name,
        scopeType: rule.scopeType,
        scopeId: rule.scopeId,
        beneficiary: rule.beneficiary,
        counselling: { kind: 'FIXED', amount: money(150) },
        firstPurchase: rule.firstPurchase,
        renewal: rule.renewal,
        status: rule.status,
        effectiveFrom: rule.effectiveFrom,
      }),
    );
    expect(updated.version).toBe(rule.version + 1);
    expect(updated.counselling).toEqual({ kind: 'FIXED', amount: money(150) });
    expect(updated.renewal).toEqual(rule.renewal);
  });
});
