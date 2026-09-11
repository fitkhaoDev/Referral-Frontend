import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EntityStatus } from '@core/models/common.model';
import { ReferralEventActions } from '../../store/referral-events.actions';
import {
  selectReferralEventsCrudError,
  selectReferralEventsSaving,
} from '../../store/referral-events.crud.reducer';
import { ReferralEventFormDialogData } from './referral-event-form-dialog.model';

@Component({
  selector: 'app-referral-event-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './referral-event-form-dialog.component.html',
  styleUrl: './referral-event-form-dialog.component.css',
})
export class ReferralEventFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<ReferralEventFormDialogData>(DIALOG_DATA);

  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly editing = this.data.mode === 'edit' ? this.data.event : null;
  protected readonly saving = this.store.selectSignal(selectReferralEventsSaving);
  private readonly crudError = this.store.selectSignal(selectReferralEventsCrudError);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    code: [
      { value: '', disabled: this.isEdit },
      [Validators.required, Validators.maxLength(48), Validators.pattern(/^[A-Z][A-Z0-9_]*$/)],
    ],
    description: ['', [Validators.maxLength(240)]],
    sortOrder: [100, [Validators.required, Validators.min(0), Validators.max(9999)]],
    active: [true],
  });

  constructor() {
    if (this.data.mode === 'edit') {
      const e = this.data.event;
      this.form.reset({
        name: e.name,
        code: e.code,
        description: e.description ?? '',
        sortOrder: e.sortOrder,
        active: e.status === 'ACTIVE',
      });
    }

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

    this.actions$
      .pipe(
        ofType(ReferralEventActions.createSuccess, ReferralEventActions.updateSuccess),
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
    const sortOrder = Number(raw.sortOrder);

    if (this.data.mode === 'edit') {
      this.store.dispatch(
        ReferralEventActions.update({
          id: this.data.event.id,
          payload: { name: raw.name.trim(), description, status, sortOrder },
        }),
      );
    } else {
      this.store.dispatch(
        ReferralEventActions.create({
          payload: {
            name: raw.name.trim(),
            code: raw.code.trim().toUpperCase(),
            description,
            status,
            sortOrder,
          },
        }),
      );
    }
  }
}
