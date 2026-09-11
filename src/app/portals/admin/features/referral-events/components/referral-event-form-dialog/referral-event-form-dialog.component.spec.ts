import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { ReferralEventsModule } from '../../referral-events.module';
import { ReferralEvent } from '../../models/referral-event.model';
import { ReferralEventActions } from '../../store/referral-events.actions';
import { ReferralEventFormDialogComponent } from './referral-event-form-dialog.component';
import { ReferralEventFormDialogData } from './referral-event-form-dialog.model';

const SAMPLE: ReferralEvent = {
  id: 'revent-000001',
  name: 'Subscription Purchased',
  code: 'SUBSCRIPTION_PURCHASED',
  description: 'First qualifying purchase',
  status: 'ACTIVE',
  sortOrder: 40,
  system: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setup(data: ReferralEventFormDialogData) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      ReferralEventsModule,
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
  const fixture = TestBed.createComponent(ReferralEventFormDialogComponent);
  fixture.detectChanges();
  return { fixture, store, dialogRef };
}

describe('ReferralEventFormDialogComponent', () => {
  it('create mode: dispatches Create with an upper-cased code and numeric order', () => {
    const { fixture, store } = setup({ mode: 'create' });
    const c = fixture.componentInstance as unknown as {
      form: { patchValue: (v: unknown) => void };
      submit: () => void;
    };
    c.form.patchValue({
      name: 'Trial Started',
      code: 'trial_started',
      description: '',
      sortOrder: 5,
      active: true,
    });
    c.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      ReferralEventActions.create({
        payload: {
          name: 'Trial Started',
          code: 'TRIAL_STARTED',
          description: undefined,
          status: 'ACTIVE',
          sortOrder: 5,
        },
      }),
    );
  });

  it('edit mode: shows the system-event notice and disables the code field', () => {
    const { fixture } = setup({ mode: 'edit', event: SAMPLE });
    expect(fixture.nativeElement.textContent).toContain('System event');
    const codeInput = Array.from(fixture.nativeElement.querySelectorAll('input')).find(
      (el) => (el as HTMLInputElement).value === 'SUBSCRIPTION_PURCHASED',
    ) as HTMLInputElement;
    expect(codeInput.disabled).toBe(true);
  });

  it('closes on update success', () => {
    const { store, dialogRef } = setup({ mode: 'edit', event: SAMPLE });
    store.dispatch(ReferralEventActions.updateSuccess({ event: SAMPLE }));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
