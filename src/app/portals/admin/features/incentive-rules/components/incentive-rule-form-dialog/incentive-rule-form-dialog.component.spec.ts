import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { IncentiveRulesModule } from '../../incentive-rules.module';
import { IncentiveRule } from '../../models/incentive-rule.model';
import { IncentiveRuleActions } from '../../store/incentive-rules.actions';
import { IncentiveRuleFormDialogComponent } from './incentive-rule-form-dialog.component';
import { IncentiveRuleFormDialogData } from './incentive-rule-form-dialog.model';

const TAPERING: IncentiveRule = {
  id: 'irule-000003',
  name: 'Fitness Trainer incentives (tapering renewals)',
  scopeType: 'PARTNER_TYPE',
  scopeId: 'ptype-000003',
  scopeLabel: 'Fitness Trainer',
  beneficiary: 'PARTNER',
  counselling: { kind: 'FIXED', amount: money(100) },
  firstPurchase: { kind: 'PERCENT', percent: 5 },
  renewal: {
    kind: 'PER_RENEWAL',
    tiers: [
      { renewalNumber: 1, incentive: { kind: 'PERCENT', percent: 3 } },
      { renewalNumber: 2, incentive: { kind: 'PERCENT', percent: 2 } },
      { renewalNumber: 3, incentive: { kind: 'PERCENT', percent: 1 } },
    ],
    beyondLastTier: { kind: 'NONE' },
  },
  status: 'ACTIVE',
  effectiveFrom: '2026-06-01',
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setup(data: IncentiveRuleFormDialogData) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      IncentiveRulesModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
    providers: [
      { provide: DIALOG_DATA, useValue: data },
      { provide: DialogRef, useValue: dialogRef },
    ],
  });
  const store = TestBed.inject(Store);
  vi.spyOn(store, 'dispatch');
  const fixture = TestBed.createComponent(IncentiveRuleFormDialogComponent);
  fixture.detectChanges();
  return { fixture, store, dialogRef };
}

function inner(fixture: ReturnType<typeof setup>['fixture']) {
  return fixture.componentInstance as unknown as {
    form: { patchValue: (v: unknown) => void; controls: Record<string, unknown> };
    submit: () => void;
  };
}

describe('IncentiveRuleFormDialogComponent', () => {
  it('create: builds a payload with counselling/first-purchase/renewal components', () => {
    const { fixture, store } = setup({ mode: 'create' });
    inner(fixture).form.patchValue({
      name: 'New doctor rule',
      scopeType: 'PARTNER_TYPE',
      scopeId: 'ptype-000001',
      beneficiary: 'PARTNER',
      counselling: { kind: 'FIXED', amount: '100' },
      firstPurchase: { kind: 'PERCENT', percent: 5 },
      renewal: { kind: 'PERCENT_INDEFINITE', percent: 3 },
      active: true,
      effectiveFrom: '2026-09-01',
    });
    fixture.detectChanges();
    inner(fixture).submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      IncentiveRuleActions.create({
        payload: {
          name: 'New doctor rule',
          scopeType: 'PARTNER_TYPE',
          scopeId: 'ptype-000001',
          beneficiary: 'PARTNER',
          counselling: { kind: 'FIXED', amount: money(100) },
          firstPurchase: { kind: 'PERCENT', percent: 5 },
          renewal: { kind: 'PERCENT_INDEFINITE', percent: 3 },
          status: 'ACTIVE',
          effectiveFrom: '2026-09-01',
        },
      }),
    );
  });

  it('edit: rebuilds the tapering renewal tiers and dispatches Update preserving them', () => {
    const { fixture, store } = setup({ mode: 'edit', rule: TAPERING });
    inner(fixture).submit();

    const call = (store.dispatch as unknown as { mock: { calls: unknown[][] } }).mock.calls.find(
      (c) => (c[0] as { type: string }).type === IncentiveRuleActions.update.type,
    );
    expect(call).toBeTruthy();
    const payload = (call![0] as { payload: IncentiveRule }).payload as unknown as IncentiveRule;
    expect(payload.renewal).toEqual(TAPERING.renewal);
  });
});
