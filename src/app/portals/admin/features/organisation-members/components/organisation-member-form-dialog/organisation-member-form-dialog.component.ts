import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EntityStatus } from '@core/models/common.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationOptionsService } from '../../data-access/organisation-options.service';
import { OrganisationMemberActions } from '../../store/organisation-members.actions';
import {
  selectOrganisationMembersCrudError,
  selectOrganisationMembersSaving,
} from '../../store/organisation-members.crud.reducer';
import { OrganisationMemberFormDialogData } from './organisation-member-form-dialog.model';

@Component({
  selector: 'app-organisation-member-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-member-form-dialog.component.html',
  styleUrl: './organisation-member-form-dialog.component.css',
})
export class OrganisationMemberFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<OrganisationMemberFormDialogData>(DIALOG_DATA);

  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly editing = this.data.mode === 'edit' ? this.data.member : null;
  protected readonly lockedOrgId =
    this.data.mode === 'create' ? (this.data.organisationId ?? null) : this.data.member.organisationId;

  protected readonly orgOptions = toSignal(inject(OrganisationOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly saving = this.store.selectSignal(selectOrganisationMembersSaving);
  private readonly crudError = this.store.selectSignal(selectOrganisationMembersCrudError);

  protected readonly form = this.fb.nonNullable.group({
    organisationId: [
      { value: this.lockedOrgId ?? '', disabled: this.isEdit || !!this.lockedOrgId },
      [Validators.required],
    ],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    specialisation: ['', [Validators.maxLength(80)]],
    mobile: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    active: [true],
  });

  constructor() {
    if (this.data.mode === 'edit') {
      const m = this.data.member;
      this.form.reset({
        organisationId: m.organisationId,
        name: m.name,
        specialisation: m.specialisation ?? '',
        mobile: m.mobile,
        email: m.email,
        active: m.status === 'ACTIVE',
      });
    }

    effect(() => {
      const err = this.crudError();
      const emailErr = err?.fieldErrors?.['email']?.[0];
      if (emailErr) this.form.controls.email.setErrors({ server: emailErr });
      const orgErr = err?.fieldErrors?.['organisationId']?.[0];
      if (orgErr) this.form.controls.organisationId.setErrors({ server: orgErr });
    });

    this.actions$
      .pipe(
        ofType(OrganisationMemberActions.createSuccess, OrganisationMemberActions.updateSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close(true));
  }

  protected genericError(): string | null {
    const err = this.crudError();
    if (!err || err.status === 422 || err.status === 409 || err.status === 404) return null;
    return err.message;
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const status: EntityStatus = raw.active ? 'ACTIVE' : 'INACTIVE';
    const specialisation = raw.specialisation.trim() || undefined;

    if (this.data.mode === 'edit') {
      this.store.dispatch(
        OrganisationMemberActions.update({
          id: this.data.member.id,
          payload: {
            name: raw.name.trim(),
            specialisation,
            mobile: raw.mobile.trim(),
            email: raw.email.trim(),
          },
        }),
      );
    } else {
      this.store.dispatch(
        OrganisationMemberActions.create({
          payload: {
            organisationId: raw.organisationId,
            name: raw.name.trim(),
            specialisation,
            mobile: raw.mobile.trim(),
            email: raw.email.trim(),
            status,
          },
        }),
      );
    }
  }
}
