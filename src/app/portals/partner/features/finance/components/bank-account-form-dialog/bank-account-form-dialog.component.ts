import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import { PartnerBankAccount } from '../../models/finance.model';
import { INDIAN_BANKS } from '../../models/indian-banks';

export interface BankAccountFormDialogData {
  mode: 'add' | 'edit';
  account?: PartnerBankAccount;
}

@Component({
  selector: 'app-bank-account-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-account-form-dialog.component.html',
  styleUrl: './bank-account-form-dialog.component.css',
})
export class BankAccountFormDialogComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly api = inject(PartnerFinanceApi);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  protected readonly data = inject<BankAccountFormDialogData>(DIALOG_DATA);

  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly banks = INDIAN_BANKS;

  private readonly initialBankCode = this.data.account?.ifsc?.slice(0, 4).toUpperCase() ?? '';

  protected readonly form = this.fb.nonNullable.group({
    bankCode: [this.initialBankCode, Validators.required],
    nickname: [this.data.account?.nickname ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)]],
    confirmAccountNumber: ['', Validators.required],
    ifsc: [this.data.account?.ifsc ?? '', [Validators.required, Validators.pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)]],
    makePrimary: [this.data.account?.isPrimary ?? false],
    currentPassword: ['', Validators.required],
  });

  constructor() {
    this.form.controls.bankCode.valueChanges.subscribe((code) => {
      const current = this.form.controls.ifsc.value.toUpperCase();
      const currentPrefix = current.slice(0, 4);
      if (code && currentPrefix !== code) {
        this.form.controls.ifsc.setValue(code, { emitEvent: false });
      }
    });

    this.form.controls.ifsc.valueChanges.subscribe((raw) => {
      const prefix = (raw ?? '').toUpperCase().slice(0, 4);
      if (prefix.length === 4 && this.form.controls.bankCode.value !== prefix) {
        if (this.banks.some((b) => b.code === prefix)) {
          this.form.controls.bankCode.setValue(prefix, { emitEvent: false });
        }
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.accountNumber !== v.confirmAccountNumber) {
      this.error.set('Account number and confirmation do not match.');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    const payload = {
      nickname: v.nickname,
      accountNumber: v.accountNumber,
      confirmAccountNumber: v.confirmAccountNumber,
      ifsc: v.ifsc.toUpperCase(),
      makePrimary: v.makePrimary,
      currentPassword: v.currentPassword,
    };

    const req = this.isEdit && this.data.account
      ? this.api.editBankAccount(this.data.account.id, payload)
      : this.api.addBankAccount(payload);

    req.subscribe({
      next: (acc) => {
        this.submitting.set(false);
        if (acc.verificationStatus === 'VERIFIED') {
          this.notifications.success('Bank account verified.');
        } else if (acc.verificationStatus === 'FAILED') {
          this.notifications.error(acc.verificationFailureReason ?? 'Verification failed.');
        } else {
          this.notifications.info('Verification in progress.');
        }
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.message ?? 'Could not save the bank account.');
      },
    });
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
