import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnerTypesModule } from '../../partner-types.module';
import { PartnerType } from '../../models/partner-type.model';
import { PartnerTypeActions } from '../../store/partner-types.actions';
import { PartnerTypeFormDialogComponent } from './partner-type-form-dialog.component';
import { PartnerTypeFormDialogData } from './partner-type-form-dialog.model';

const SAMPLE: PartnerType = {
  id: 'ptype-000001',
  name: 'Doctor',
  code: 'DOCTOR',
  description: 'Registered practitioners',
  status: 'ACTIVE',
  partnerCount: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setup(data: PartnerTypeFormDialogData) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      PartnerTypesModule,
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
  const fixture = TestBed.createComponent(PartnerTypeFormDialogComponent);
  fixture.detectChanges();
  return { fixture, store, dialogRef };
}

describe('PartnerTypeFormDialogComponent', () => {
  it('create mode: blocks submit until valid, then dispatches Create with an upper-cased code', () => {
    const { fixture, store } = setup({ mode: 'create' });
    const c = fixture.componentInstance as unknown as {
      form: { patchValue: (v: unknown) => void };
      submit: () => void;
    };

    c.submit();
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: PartnerTypeActions.create.type }),
    );

    c.form.patchValue({ name: 'Wellness Coach', code: 'wellness_coach', description: '', active: true });
    c.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      PartnerTypeActions.create({
        payload: {
          name: 'Wellness Coach',
          code: 'WELLNESS_COACH',
          description: undefined,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('edit mode: pre-fills the form and disables the code field', () => {
    const { fixture } = setup({ mode: 'edit', partnerType: SAMPLE });
    const codeInput = Array.from(fixture.nativeElement.querySelectorAll('input')).find(
      (el) => (el as HTMLInputElement).value === 'DOCTOR',
    ) as HTMLInputElement;
    expect(codeInput.disabled).toBe(true);
  });

  it('edit mode: dispatches Update (no code) on save', () => {
    const { fixture, store } = setup({ mode: 'edit', partnerType: SAMPLE });
    (fixture.componentInstance as unknown as { submit: () => void }).submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      PartnerTypeActions.update({
        id: SAMPLE.id,
        payload: { name: 'Doctor', description: 'Registered practitioners', status: 'ACTIVE' },
      }),
    );
  });

  it('closes the dialog on a create success', () => {
    const { store, dialogRef } = setup({ mode: 'create' });
    store.dispatch(PartnerTypeActions.createSuccess({ partnerType: SAMPLE }));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
