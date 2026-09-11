import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { DiscountRulesModule } from '../../discount-rules.module';
import { DiscountRule } from '../../models/discount-rule.model';
import { DiscountRuleActions } from '../../store/discount-rules.actions';
import { DiscountRuleFormDialogComponent } from './discount-rule-form-dialog.component';
import { DiscountRuleFormDialogData } from './discount-rule-form-dialog.model';

const RULE: DiscountRule = {
  id: 'drule-000003',
  name: 'Apollo Dum Dum discount',
  scopeType: 'ORGANISATION',
  scopeId: 'org-000001',
  scopeLabel: 'Apollo Hospital — Dum Dum',
  discount: { kind: 'FIXED', amount: money(1500) },
  status: 'ACTIVE',
  effectiveFrom: '2026-07-01',
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setup(data: DiscountRuleFormDialogData) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      DiscountRulesModule,
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
  const fixture = TestBed.createComponent(DiscountRuleFormDialogComponent);
  fixture.detectChanges();
  return { fixture, store, dialogRef };
}

function inner(fixture: ReturnType<typeof setup>['fixture']) {
  return fixture.componentInstance as unknown as {
    form: { patchValue: (v: unknown) => void };
    submit: () => void;
  };
}

describe('DiscountRuleFormDialogComponent', () => {
  it('create PERCENT rule: builds a DiscountValue with percent + optional cap', () => {
    const { fixture, store } = setup({ mode: 'create' });
    inner(fixture).form.patchValue({
      name: 'New percent rule',
      scopeType: 'PARTNER_TYPE',
      scopeId: 'ptype-000002',
      kind: 'PERCENT',
      percent: 15,
      maxAmount: '3000',
      effectiveFrom: '2026-09-01',
      active: true,
    });
    fixture.detectChanges();
    inner(fixture).submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      DiscountRuleActions.create({
        payload: {
          name: 'New percent rule',
          scopeType: 'PARTNER_TYPE',
          scopeId: 'ptype-000002',
          discount: { kind: 'PERCENT', percent: 15, maxAmount: money(3000) },
          status: 'ACTIVE',
          effectiveFrom: '2026-09-01',
        },
      }),
    );
  });

  it('GLOBAL scope drops scopeId', () => {
    const { fixture, store } = setup({ mode: 'create' });
    inner(fixture).form.patchValue({
      name: 'Global rule',
      scopeType: 'GLOBAL',
      kind: 'FIXED',
      amount: '500',
      effectiveFrom: '2026-09-01',
      active: true,
    });
    fixture.detectChanges();
    inner(fixture).submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      DiscountRuleActions.create({
        payload: {
          name: 'Global rule',
          scopeType: 'GLOBAL',
          scopeId: undefined,
          discount: { kind: 'FIXED', amount: money(500) },
          status: 'ACTIVE',
          effectiveFrom: '2026-09-01',
        },
      }),
    );
  });

  it('edit: pre-fills from the rule and dispatches Update', () => {
    const { fixture, store } = setup({ mode: 'edit', rule: RULE });
    inner(fixture).submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: DiscountRuleActions.update.type }),
    );
  });
});
