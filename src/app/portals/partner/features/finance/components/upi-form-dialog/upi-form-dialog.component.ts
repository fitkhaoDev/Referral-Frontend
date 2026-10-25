import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { PartnerUpi } from '../../models/finance.model';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';

export interface UpiFormDialogData {
  mode: 'add';
}

type VerificationFailure = Readonly<{
  reason: string;
  bankReturnedName?: string;
  similarity?: number;
}>;

/**
 * Add a new UPI payout destination. Verification runs synchronously via the
 * payout vendor (VPA validation on RazorpayX); result lands in the response.
 * On FAILED the dialog stays open so the user can see the mismatch details
 * and either edit the VPA or cancel.
 */
@Component({
  selector: 'app-upi-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upi-form-dialog.component.html',
  styleUrl: './upi-form-dialog.component.css',
})
export class UpiFormDialogComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly api = inject(PartnerFinanceApi);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthFacadeService);
  protected readonly data = inject<UpiFormDialogData>(DIALOG_DATA);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verificationFailure = signal<VerificationFailure | null>(null);

  private readonly partnerSession = this.auth.user('partner');
  protected readonly registeredName = computed(
    () => this.partnerSession()?.displayName ?? 'your account name',
  );

  protected readonly form = this.fb.nonNullable.group({
    nickname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    vpa: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/)]],
    makePrimary: [false],
    currentPassword: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.verificationFailure.set(null);

    const v = this.form.getRawValue();
    this.api
      .addUpi({
        nickname: v.nickname.trim(),
        vpa: v.vpa.trim().toLowerCase(),
        makePrimary: v.makePrimary,
        currentPassword: v.currentPassword,
      })
      .subscribe({
        next: (acc) => {
          this.submitting.set(false);
          this.handleResult(acc);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Could not add the UPI ID.');
        },
      });
  }

  private handleResult(acc: PartnerUpi): void {
    if (acc.verificationStatus === 'VERIFIED') {
      this.notifications.success('UPI verified.');
      this.dialogRef.close(true);
      return;
    }
    if (acc.verificationStatus === 'FAILED') {
      this.verificationFailure.set({
        reason: acc.verificationFailureReason ?? 'Verification failed.',
        bankReturnedName: acc.bankReturnedName,
        similarity: acc.nameMatchSimilarity,
      });
      return;
    }
    this.notifications.info('Verification in progress.');
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
