import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';

@Component({
  selector: 'app-partner-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-login.component.html',
  styleUrl: './partner-login.component.css',
})
export class PartnerLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacadeService);

  protected readonly busy = this.auth.busy('partner');
  protected readonly error = this.auth.error('partner');

  protected readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.clearError('partner');
    this.auth.login('partner', this.form.getRawValue());
  }
}
