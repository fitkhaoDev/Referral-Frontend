import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { Audience } from '@core/auth/models/auth.model';

interface RoleTab {
  readonly audience: Audience;
  readonly label: string;
  readonly identifierLabel: string;
  readonly identifierPlaceholder: string;
  readonly hint?: string;
}

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

  protected readonly roleTabs: RoleTab[] = [
    {
      audience: 'partner',
      label: 'Partner',
      identifierLabel: 'Email or Partner ID',
      identifierPlaceholder: 'you@example.com or FK-IND-000123',
      hint: 'First time? Use the temporary password from your FitKhao administrator.',
    },
    {
      audience: 'admin',
      label: 'Admin',
      identifierLabel: 'Work email',
      identifierPlaceholder: 'you@fitkhao.com',
    },
  ];

  protected readonly selectedAudience = signal<Audience>('partner');

  private readonly adminBusy = this.auth.busy('admin');
  private readonly partnerBusy = this.auth.busy('partner');
  private readonly adminError = this.auth.error('admin');
  private readonly partnerError = this.auth.error('partner');

  protected readonly busy = computed(() =>
    this.selectedAudience() === 'admin' ? this.adminBusy() : this.partnerBusy(),
  );
  protected readonly error = computed(() =>
    this.selectedAudience() === 'admin' ? this.adminError() : this.partnerError(),
  );
  protected readonly activeTab = computed(
    () => this.roleTabs.find((t) => t.audience === this.selectedAudience())!,
  );

  protected readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected selectAudience(audience: Audience): void {
    if (this.selectedAudience() === audience) return;
    this.selectedAudience.set(audience);
    this.auth.clearError('admin');
    this.auth.clearError('partner');
    this.form.reset();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.clearError(this.selectedAudience());
    this.auth.login(this.selectedAudience(), this.form.getRawValue());
  }
}
