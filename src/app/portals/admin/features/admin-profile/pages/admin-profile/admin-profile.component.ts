import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { AuthActions } from '@core/auth/store/auth.actions';
import { NotificationService } from '@core/notifications/notification.service';
import { matchWith, strongPassword } from '@shared/validators/password.validators';

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css',
})
export class AdminProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacadeService);
  private readonly actions$ = inject(Actions);
  private readonly notifications = inject(NotificationService);

  protected readonly user = this.auth.user('admin');
  protected readonly permissions = this.auth.permissions('admin');
  protected readonly busy = this.auth.busy('admin');
  private readonly error = this.auth.error('admin');

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
      if (newPasswordFieldMsg) this.form.controls.newPassword.setErrors({ server: newPasswordFieldMsg });
    });

    this.form.controls.newPassword.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());

    this.actions$
      .pipe(ofType(AuthActions.changePasswordSuccess), takeUntilDestroyed())
      .subscribe(({ audience }) => {
        if (audience !== 'admin') return;
        this.form.reset();
        this.notifications.success('Password changed');
      });
  }

  protected weakHint(): string {
    const failed = this.form.controls.newPassword.errors?.['weakPassword'] as string[] | undefined;
    return failed?.join(', ') ?? 'a stronger password';
  }

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
    this.auth.clearError('admin');
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.auth.changePassword('admin', { currentPassword, newPassword });
  }

  protected signOut(): void {
    this.auth.logout('admin');
  }
}
