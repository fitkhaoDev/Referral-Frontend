import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { UpiFormDialogComponent } from '../../components/upi-form-dialog/upi-form-dialog.component';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import {
  PartnerProfile,
  PartnerUpi,
  PartnerUpiList,
} from '../../models/finance.model';

// NOTE: Bank-account add/edit UI is temporarily hidden. The backend
// bank-account endpoints are still wired for future reactivation. For now
// payouts are routed exclusively through UPI (zero vendor fee).
@Component({
  selector: 'app-partner-profile-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-profile-page.component.html',
  styleUrl: './partner-profile-page.component.css',
})
export class PartnerProfilePageComponent {
  private readonly api = inject(PartnerFinanceApi);
  private readonly dialog = inject(Dialog);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);

  protected readonly profile = signal<PartnerProfile | null>(null);
  protected readonly upiData = signal<PartnerUpiList | null>(null);
  protected readonly editing = signal(false);
  protected readonly savingProfile = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    professionalAddress: ['', [Validators.maxLength(240)]],
  });

  private readonly _bootstrapProfile = toSignal(
    this.api.getMyProfile().pipe(
      tap((p) => this.hydrate(p)),
      catchError(() => of(null)),
    ),
    { initialValue: null },
  );

  protected readonly bootstrapUpi = toSignal(
    this.api.listUpi().pipe(
      tap((d) => this.upiData.set(d)),
      catchError(() => of(null)),
    ),
    { initialValue: null },
  );

  private addressOf(p: PartnerProfile): string {
    return p.professionalAddress ?? p.address ?? '';
  }

  private hydrate(p: PartnerProfile): void {
    this.profile.set(p);
    this.form.patchValue(
      { name: p.name, professionalAddress: this.addressOf(p) },
      { emitEvent: false },
    );
  }

  protected startEdit(): void {
    const p = this.profile();
    if (p) {
      this.form.patchValue(
        { name: p.name, professionalAddress: this.addressOf(p) },
        { emitEvent: false },
      );
    }
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    const v = this.form.getRawValue();
    this.api
      .updateMyProfile({
        name: v.name.trim(),
        professionalAddress: v.professionalAddress.trim(),
      })
      .subscribe({
        next: (p) => {
          this.hydrate(p);
          this.savingProfile.set(false);
          this.editing.set(false);
          this.notifications.success('Profile updated.');
        },
        error: (err) => {
          this.savingProfile.set(false);
          this.notifications.error(err?.message ?? 'Could not update profile.');
        },
      });
  }

  protected refreshUpi(): void {
    this.api
      .listUpi()
      .pipe(catchError(() => of(null)))
      .subscribe((d) => this.upiData.set(d));
  }

  protected addUpi(): void {
    const ref = this.dialog.open<boolean | undefined>(UpiFormDialogComponent, {
      data: { mode: 'add' },
      panelClass: 'fk-dialog-panel',
      width: 'min(560px, 95vw)',
      autoFocus: 'dialog',
    });
    ref.closed.subscribe((changed) => {
      if (changed) this.refreshUpi();
    });
  }

  protected makePrimary(acc: PartnerUpi): void {
    this.api.makeUpiPrimary(acc.id).subscribe({
      next: () => {
        this.notifications.success(`${acc.nickname} is now your primary UPI.`);
        this.refreshUpi();
      },
      error: (err) => this.notifications.error(err?.message ?? 'Could not update primary.'),
    });
  }

  protected async deleteUpi(acc: PartnerUpi): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${acc.nickname}"?`,
      message: 'The UPI will be removed. In-flight withdrawals are not affected.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const pwd = window.prompt('Please re-enter your password to confirm deletion.');
    if (!pwd) return;
    this.api.deleteUpi(acc.id, pwd).subscribe({
      next: () => {
        this.notifications.success('UPI deleted.');
        this.refreshUpi();
      },
      error: (err) => this.notifications.error(err?.message ?? 'Could not delete.'),
    });
  }

  protected tone(status: PartnerUpi['verificationStatus']): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING_VERIFICATION':
        return 'warning';
      case 'FAILED':
        return 'danger';
    }
  }
  protected statusLabel(status: PartnerUpi['verificationStatus']): string {
    switch (status) {
      case 'VERIFIED':
        return 'Verified';
      case 'PENDING_VERIFICATION':
        return 'Verifying';
      case 'FAILED':
        return 'Verification failed';
    }
  }
}
