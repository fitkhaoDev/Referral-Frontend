import { TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { IncentiveRulesModule } from '../../incentive-rules.module';
import {
  makeIncentiveComponentGroup,
  readIncentiveComponent,
} from '../incentive-form.util';
import { IncentiveComponentFieldComponent } from './incentive-component-field.component';

describe('IncentiveComponentFieldComponent', () => {
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

  it('shows the percent input only for PERCENT and applies validators', async () => {
    const fb = TestBed.inject(NonNullableFormBuilder);
    const group = makeIncentiveComponentGroup(fb, { kind: 'PERCENT', percent: 5 });
    const fixture = TestBed.createComponent(IncentiveComponentFieldComponent);
    fixture.componentRef.setInput('group', group);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[type=number]')).toBeTruthy();

    group.controls.percent.setValue(0);
    group.controls.percent.updateValueAndValidity();
    expect(group.controls.percent.valid).toBe(false);

    group.controls.kind.setValue('NONE');
    await fixture.whenStable();
    fixture.detectChanges();
    group.controls.percent.updateValueAndValidity();
    expect(group.controls.percent.valid).toBe(true);
  });

  it('readIncentiveComponent converts the rupee string to Money for FIXED', () => {
    const fb = TestBed.inject(NonNullableFormBuilder);
    const group = makeIncentiveComponentGroup(fb, { kind: 'FIXED', amount: money(250) });
    expect(readIncentiveComponent(group)).toEqual({ kind: 'FIXED', amount: money(250) });
  });
});
