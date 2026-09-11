import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { ORGANISATION_SEED } from '../../../_fixtures/organisation-catalog';
import { OrganisationMembersModule } from '../../organisation-members.module';
import { OrganisationMemberActions } from '../../store/organisation-members.actions';
import { OrganisationMemberFormDialogComponent } from './organisation-member-form-dialog.component';
import { OrganisationMemberFormDialogData } from './organisation-member-form-dialog.model';

function setup(data: OrganisationMemberFormDialogData) {
  const dialogRef = { close: vi.fn() };
  TestBed.configureTestingModule({
    imports: [
      OrganisationMembersModule,
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
  const fixture = TestBed.createComponent(OrganisationMemberFormDialogComponent);
  fixture.detectChanges();
  return { fixture, store, dialogRef };
}

describe('OrganisationMemberFormDialogComponent', () => {
  it('create mode with a locked organisation: dispatches Create for that org', () => {
    const apollo = ORGANISATION_SEED[0];
    const { fixture, store } = setup({ mode: 'create', organisationId: apollo.id });
    const c = fixture.componentInstance as unknown as {
      form: { patchValue: (v: unknown) => void };
      submit: () => void;
    };
    c.form.patchValue({
      name: 'Dr. Scoped',
      mobile: '+91 9000000010',
      email: 'scoped@org.example.com',
      active: true,
    });
    c.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      OrganisationMemberActions.create({
        payload: {
          organisationId: apollo.id,
          name: 'Dr. Scoped',
          specialisation: undefined,
          mobile: '+91 9000000010',
          email: 'scoped@org.example.com',
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('edit mode: organisation field is disabled and Update omits it', () => {
    const member = {
      id: 'omember-000001',
      organisationId: ORGANISATION_SEED[0].id,
      organisationName: ORGANISATION_SEED[0].name,
      organisationReferralCode: ORGANISATION_SEED[0].referralCode,
      name: 'Dr. John Doe',
      specialisation: 'Cardiology',
      mobile: '+91 9000000001',
      email: 'john@org.example.com',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { fixture, store } = setup({ mode: 'edit', member });
    expect((fixture.nativeElement.querySelector('select') as HTMLSelectElement).disabled).toBe(true);

    (fixture.componentInstance as unknown as { submit: () => void }).submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      OrganisationMemberActions.update({
        id: member.id,
        payload: {
          name: 'Dr. John Doe',
          specialisation: 'Cardiology',
          mobile: '+91 9000000001',
          email: 'john@org.example.com',
        },
      }),
    );
  });
});
