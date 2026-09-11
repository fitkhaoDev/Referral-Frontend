import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EntityStatus } from '@core/models/common.model';
import { PartnerTypeActions } from '../../store/partner-types.actions';
import {
  selectPartnerTypesCrudError,
  selectPartnerTypesSaving,
} from '../../store/partner-types.crud.reducer';
import { PartnerTypeFormDialogData } from './partner-type-form-dialog.model';

@Component({
  selector: 'app-partner-type-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-type-form-dialog.component.html',
  styleUrl: './partner-type-form-dialog.component.css',
})
export class PartnerTypeFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<PartnerTypeFormDialogData>(DIALOG_DATA);

  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly editing = this.data.mode === 'edit' ? this.data.partnerType : null;
  protected readonly saving = this.store.selectSignal(selectPartnerTypesSaving);
  private readonly crudError = this.store.selectSignal(selectPartnerTypesCrudError);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    code: [
      { value: '', disabled: this.isEdit },
      [Validators.required, Validators.maxLength(40), Validators.pattern(/^[A-Z][A-Z0-9_]*$/)],
    ],
    description: ['', [Validators.maxLength(240)]],
    active: [true],
  });

  constructor() {
    if (this.data.mode === 'edit') {
      const t = this.data.partnerType;
      this.form.reset({
        name: t.name,
        code: t.code,
        description: t.description ?? '',
        active: t.status === 'ACTIVE',
      });
    }

    // Map server field errors / show generic errors.
    effect(() => {
      const err = this.crudError();
      const codeErr = err?.fieldErrors?.['code']?.[0];
      if (codeErr) this.form.controls.code.setErrors({ server: codeErr });
      const nameErr = err?.fieldErrors?.['name']?.[0];
      if (nameErr) this.form.controls.name.setErrors({ server: nameErr });
    });

    // Force the code field to UPPER_SNAKE as the user types.
    this.form.controls.code.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const upper = value.toUpperCase();
      if (upper !== value) this.form.controls.code.setValue(upper, { emitEvent: false });
    });

    // Close on a successful save.
    this.actions$
      .pipe(
        ofType(PartnerTypeActions.createSuccess, PartnerTypeActions.updateSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close(true));
  }

  protected genericError(): string | null {
    const err = this.crudError();
    if (!err || err.status === 422 || err.status === 409) return null;
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
    const description = raw.description.trim() || undefined;

    if (this.data.mode === 'edit') {
      this.store.dispatch(
        PartnerTypeActions.update({
          id: this.data.partnerType.id,
          payload: { name: raw.name.trim(), description, status },
        }),
      );
    } else {
      this.store.dispatch(
        PartnerTypeActions.create({
          payload: { name: raw.name.trim(), code: raw.code.trim().toUpperCase(), description, status },
        }),
      );
    }
  }
}
