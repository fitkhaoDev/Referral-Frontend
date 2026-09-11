import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacadeService);

  protected readonly busy = this.auth.busy('admin');
  protected readonly error = this.auth.error('admin');

  protected readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.clearError('admin');
    this.auth.login('admin', this.form.getRawValue());
  }
}
