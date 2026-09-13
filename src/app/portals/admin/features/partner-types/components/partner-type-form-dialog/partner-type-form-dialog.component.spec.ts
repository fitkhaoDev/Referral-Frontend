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
  return { fixture, store, dialogRef, component: fixture.componentInstance as any };
}

describe('PartnerTypeFormDialogComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ── Create mode ───────────────────────────────────────────────────────────────

  describe('create mode', () => {
    it('blocks submit when form is invalid and does not dispatch', () => {
      const { component, store } = setup({ mode: 'create' });
      component.submit();
      expect(store.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: PartnerTypeActions.create.type }),
      );
    });

    it('marks all controls as touched on invalid submit', () => {
      const { component } = setup({ mode: 'create' });
      component.submit();
      expect(component.form.controls.name.touched).toBe(true);
      expect(component.form.controls.code.touched).toBe(true);
    });

    it('dispatches Create with an upper-cased code on valid submit', () => {
      const { component, store } = setup({ mode: 'create' });
      component.form.patchValue({ name: 'Wellness Coach', code: 'wellness_coach', description: '', active: true });
      component.submit();
      expect(store.dispatch).toHaveBeenCalledWith(
        PartnerTypeActions.create({
          payload: { name: 'Wellness Coach', code: 'WELLNESS_COACH', description: undefined, status: 'ACTIVE' },
        }),
      );
    });

    it('dispatches Create with INACTIVE status when active=false', () => {
      const { component, store } = setup({ mode: 'create' });
      component.form.patchValue({ name: 'X', code: 'X_CODE', active: false });
      component.submit();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ payload: expect.objectContaining({ status: 'INACTIVE' }) }),
      );
    });

    it('includes description when filled in', () => {
      const { component, store } = setup({ mode: 'create' });
      component.form.patchValue({ name: 'Coach', code: 'COACH', description: 'Wellness pros', active: true });
      component.submit();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ payload: expect.objectContaining({ description: 'Wellness pros' }) }),
      );
    });

    it('omits description when blank (sends undefined)', () => {
      const { component, store } = setup({ mode: 'create' });
      component.form.patchValue({ name: 'Coach', code: 'COACHX', description: '   ', active: true });
      component.submit();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ payload: expect.objectContaining({ description: undefined }) }),
      );
    });

    it('auto-uppercases the code as the user types', () => {
      const { component } = setup({ mode: 'create' });
      component.form.controls.code.setValue('lowercase');
      expect(component.form.controls.code.value).toBe('LOWERCASE');
    });

    it('shows required error on code when empty', () => {
      const { component } = setup({ mode: 'create' });
      component.form.controls.code.markAsTouched();
      expect(component.form.controls.code.hasError('required')).toBe(true);
    });

    it('shows pattern error when code contains invalid characters', () => {
      const { component } = setup({ mode: 'create' });
      component.form.controls.code.setValue('invalid code!');
      component.form.controls.code.markAsTouched();
      expect(component.form.controls.code.hasError('pattern')).toBe(true);
    });

    it('closes the dialog with true when createSuccess is dispatched', () => {
      const { store, dialogRef } = setup({ mode: 'create' });
      store.dispatch(PartnerTypeActions.createSuccess({ partnerType: SAMPLE }));
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('closes the dialog with false on cancel', () => {
      const { component, dialogRef } = setup({ mode: 'create' });
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });

    it('genericError returns null when no error', () => {
      const { component } = setup({ mode: 'create' });
      expect(component.genericError()).toBeNull();
    });
  });

  // ── Edit mode ─────────────────────────────────────────────────────────────────

  describe('edit mode', () => {
    it('pre-fills form with the partnerType values', () => {
      const { component } = setup({ mode: 'edit', partnerType: SAMPLE });
      expect(component.form.controls.name.value).toBe(SAMPLE.name);
      expect(component.form.controls.description.value).toBe(SAMPLE.description);
      expect(component.form.controls.active.value).toBe(true);
    });

    it('pre-fills active=false when status is INACTIVE', () => {
      const { component } = setup({ mode: 'edit', partnerType: { ...SAMPLE, status: 'INACTIVE' } });
      expect(component.form.controls.active.value).toBe(false);
    });

    it('disables the code field', () => {
      const { component } = setup({ mode: 'edit', partnerType: SAMPLE });
      expect(component.form.controls.code.disabled).toBe(true);
    });

    it('dispatches Update (without code) on valid save', () => {
      const { component, store } = setup({ mode: 'edit', partnerType: SAMPLE });
      component.submit();
      expect(store.dispatch).toHaveBeenCalledWith(
        PartnerTypeActions.update({
          id: SAMPLE.id,
          payload: { name: 'Doctor', description: 'Registered practitioners', status: 'ACTIVE' },
        }),
      );
    });

    it('dispatches Update with changed name', () => {
      const { component, store } = setup({ mode: 'edit', partnerType: SAMPLE });
      component.form.controls.name.setValue('Updated Name');
      component.submit();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ payload: expect.objectContaining({ name: 'Updated Name' }) }),
      );
    });

    it('closes the dialog with true when updateSuccess is dispatched', () => {
      const { store, dialogRef } = setup({ mode: 'edit', partnerType: SAMPLE });
      store.dispatch(PartnerTypeActions.updateSuccess({ partnerType: SAMPLE }));
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('closes the dialog with false on cancel', () => {
      const { component, dialogRef } = setup({ mode: 'edit', partnerType: SAMPLE });
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────────

  describe('field validation', () => {
    it('name — required error when empty', () => {
      const { component } = setup({ mode: 'create' });
      component.form.controls.name.setValue('');
      component.form.controls.name.markAsTouched();
      expect(component.form.controls.name.hasError('required')).toBe(true);
    });

    it('name — maxlength error when too long', () => {
      const { component } = setup({ mode: 'create' });
      component.form.controls.name.setValue('A'.repeat(61));
      expect(component.form.controls.name.hasError('maxlength')).toBe(true);
    });

    it('description — maxlength error when too long', () => {
      const { component } = setup({ mode: 'create' });
      component.form.controls.description.setValue('D'.repeat(241));
      expect(component.form.controls.description.hasError('maxlength')).toBe(true);
    });

    it('form is valid with all correct fields', () => {
      const { component } = setup({ mode: 'create' });
      component.form.patchValue({ name: 'Valid Name', code: 'VALID_CODE', active: true });
      expect(component.form.valid).toBe(true);
    });
  });

  // ── Generic error helper ──────────────────────────────────────────────────────

  describe('genericError()', () => {
    it('returns null when status is 422 (field errors shown inline)', () => {
      const { component, store } = setup({ mode: 'create' });
      store.dispatch(
        PartnerTypeActions.createFailure({
          error: { status: 422, code: 'VALIDATION', message: 'Validation failed.' },
        }),
      );
      expect(component.genericError()).toBeNull();
    });

    it('returns null when status is 409 (duplicate code shown inline)', () => {
      const { component, store } = setup({ mode: 'create' });
      store.dispatch(
        PartnerTypeActions.createFailure({
          error: { status: 409, code: 'CODE_TAKEN', message: 'Code taken.' },
        }),
      );
      expect(component.genericError()).toBeNull();
    });

    it('returns the error message for non-field-error statuses', () => {
      const { component, store } = setup({ mode: 'create' });
      store.dispatch(
        PartnerTypeActions.createFailure({
          error: { status: 500, code: 'SERVER_ERROR', message: 'Server failed.' },
        }),
      );
      // value appears after next change detection cycle
      expect(typeof component.genericError()).toBe('string');
    });
  });
});
