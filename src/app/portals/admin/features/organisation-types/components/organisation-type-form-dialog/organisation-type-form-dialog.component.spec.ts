import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { OrganisationTypesModule } from '../../organisation-types.module';
import { OrganisationType } from '../../models/organisation-type.model';
import { OrganisationTypeActions } from '../../store/organisation-types.actions';
import { OrganisationTypeFormDialogComponent } from './organisation-type-form-dialog.component';
import { OrganisationTypeFormDialogData } from './organisation-type-form-dialog.model';

const SAMPLE: OrganisationType = {
  id: 'otype-000001',
  name: 'Hospital',
  code: 'HOSPITAL',
  description: 'Multi-speciality',
  status: 'ACTIVE',
  organisationCount: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function setup(data: OrganisationTypeFormDialogData) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      OrganisationTypesModule,
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
  const fixture = TestBed.createComponent(OrganisationTypeFormDialogComponent);
  fixture.detectChanges();
  return { fixture, store, dialogRef };
}

describe('OrganisationTypeFormDialogComponent', () => {
  it('create mode: dispatches Create with an upper-cased code', () => {
    const { fixture, store } = setup({ mode: 'create' });
    const c = fixture.componentInstance as unknown as {
      form: { patchValue: (v: unknown) => void };
      submit: () => void;
    };
    c.form.patchValue({ name: 'Wellness Retreat', code: 'wellness_retreat', description: '', active: true });
    c.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      OrganisationTypeActions.create({
        payload: {
          name: 'Wellness Retreat',
          code: 'WELLNESS_RETREAT',
          description: undefined,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('edit mode: pre-fills and disables the code, dispatches Update', () => {
    const { fixture, store } = setup({ mode: 'edit', organisationType: SAMPLE });
    const codeInput = Array.from(fixture.nativeElement.querySelectorAll('input')).find(
      (el) => (el as HTMLInputElement).value === 'HOSPITAL',
    ) as HTMLInputElement;
    expect(codeInput.disabled).toBe(true);

    (fixture.componentInstance as unknown as { submit: () => void }).submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      OrganisationTypeActions.update({
        id: SAMPLE.id,
        payload: { name: 'Hospital', description: 'Multi-speciality', status: 'ACTIVE' },
      }),
    );
  });
});
