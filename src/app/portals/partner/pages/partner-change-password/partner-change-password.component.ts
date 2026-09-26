import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { matchWith, strongPassword } from '@shared/validators/password.validators';

@Component({
  selector: 'app-partner-change-password',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-change-password.component.html',
  styleUrl: './partner-change-password.component.css',
})
export class PartnerChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacadeService);

  protected readonly busy = this.auth.busy('partner');
  protected readonly forced = this.auth.mustChangePassword('partner');
  private readonly error = this.auth.error('partner');

  protected readonly form = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, strongPassword()]],
    confirmPassword: ['', [Validators.required, matchWith('newPassword')]],
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const err = this.error();
      if (!err) return;

      const currentPasswordFieldMsg = err.fieldErrors?.['currentPassword']?.[0];
      const looksLikeWrongCurrent =
        err.status === 401 ||
        err.code === 'INVALID_CURRENT_PASSWORD' ||
        /current.*password/i.test(err.message ?? '');
      if (currentPasswordFieldMsg || looksLikeWrongCurrent) {
        this.form.controls.currentPassword.setErrors({
          server: currentPasswordFieldMsg ?? 'Current password is incorrect.',
        });
      }

      const newPasswordFieldMsg = err.fieldErrors?.['newPassword']?.[0];
      if (newPasswordFieldMsg) {
        this.form.controls.newPassword.setErrors({ server: newPasswordFieldMsg });
      }
    });

    // Re-check the confirm field whenever the new password changes.
    this.form.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  protected weakHint(): string {
    const failed = this.form.controls.newPassword.errors?.['weakPassword'] as string[] | undefined;
    return failed?.join(', ') ?? 'a stronger password';
  }

  /** Non-field errors become a banner; field errors (422) attach to the control. */
  protected genericError(): string | null {
    const err = this.error();
    if (!err || err.status === 422) return null;
    // Wrong current-password errors are shown inline on the field, so skip the banner.
    const looksLikeWrongCurrent =
      err.status === 401 ||
      err.code === 'INVALID_CURRENT_PASSWORD' ||
      /current.*password/i.test(err.message ?? '');
    if (looksLikeWrongCurrent) return null;
    return err.message;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.clearError('partner');
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.auth.changePassword('partner', { currentPassword, newPassword });
  }
}
