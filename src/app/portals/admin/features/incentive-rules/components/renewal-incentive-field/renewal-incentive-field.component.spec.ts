import { TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { IncentiveRulesModule } from '../../incentive-rules.module';
import { makeRenewalGroup, readRenewalIncentive } from '../incentive-form.util';
import { RenewalIncentiveFieldComponent } from './renewal-incentive-field.component';

describe('RenewalIncentiveFieldComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IncentiveRulesModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
    });
  });

  it('adds and removes renewal tiers, keeping at least one', async () => {
    const fb = TestBed.inject(NonNullableFormBuilder);
    const group = makeRenewalGroup(fb, {
      kind: 'PER_RENEWAL',
      tiers: [{ renewalNumber: 1, incentive: { kind: 'PERCENT', percent: 3 } }],
      beyondLastTier: { kind: 'NONE' },
    });
    const fixture = TestBed.createComponent(RenewalIncentiveFieldComponent);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      addTier: () => void;
      removeTier: (i: number) => void;
    };
    component.addTier();
    component.addTier();
    expect(group.controls.tiers.length).toBe(3);

    component.removeTier(0);
    expect(group.controls.tiers.length).toBe(2);

    component.removeTier(0);
    component.removeTier(0);
    expect(group.controls.tiers.length).toBe(1);
  });

  it('readRenewalIncentive serialises PER_RENEWAL with positional renewalNumbers + beyondLastTier', () => {
    const fb = TestBed.inject(NonNullableFormBuilder);
    const group = makeRenewalGroup(fb, {
      kind: 'PER_RENEWAL',
      tiers: [
        { renewalNumber: 1, incentive: { kind: 'PERCENT', percent: 3 } },
        { renewalNumber: 2, incentive: { kind: 'PERCENT', percent: 2 } },
      ],
      beyondLastTier: { kind: 'NONE' },
    });
    expect(readRenewalIncentive(group)).toEqual({
      kind: 'PER_RENEWAL',
      tiers: [
        { renewalNumber: 1, incentive: { kind: 'PERCENT', percent: 3 } },
        { renewalNumber: 2, incentive: { kind: 'PERCENT', percent: 2 } },
      ],
      beyondLastTier: { kind: 'NONE' },
    });
  });

  it('readRenewalIncentive returns { kind: NONE } for NONE', () => {
    const fb = TestBed.inject(NonNullableFormBuilder);
    const group = makeRenewalGroup(fb, { kind: 'NONE' });
    expect(readRenewalIncentive(group)).toEqual({ kind: 'NONE' });
  });
});
