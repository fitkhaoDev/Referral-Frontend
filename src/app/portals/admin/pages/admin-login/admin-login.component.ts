import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;
const USER_ID_RE = /^[a-zA-Z0-9._-]{3,}$/;

function emailMobileOrUserId(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '').trim();
  if (!raw) return null;
  return EMAIL_RE.test(raw) || MOBILE_RE.test(raw) || USER_ID_RE.test(raw)
    ? null
    : { identifier: true };
}

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
  private readonly router = inject(Router);

  protected readonly busy = this.auth.busy('admin');
  protected readonly error = this.auth.error('admin');

  protected readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, emailMobileOrUserId]],
    password: ['', [Validators.required]],
  });

  protected goToPartner(): void {
    void this.router.navigate(['/partner/login']);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.clearError('admin');
    this.auth.login('admin', this.form.getRawValue());
  }
}
