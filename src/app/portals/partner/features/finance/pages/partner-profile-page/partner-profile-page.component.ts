import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { BankAccountFormDialogComponent } from '../../components/bank-account-form-dialog/bank-account-form-dialog.component';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import {
  PartnerBankAccount,
  PartnerBankAccountList,
  PartnerProfile,
} from '../../models/finance.model';

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
  protected readonly bankData = signal<PartnerBankAccountList | null>(null);
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

  private readonly _bootstrapBanks = toSignal(
    this.api.listBankAccounts().pipe(
      tap((d) => this.bankData.set(d)),
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

  protected refreshBanks(): void {
    this.api
      .listBankAccounts()
      .pipe(catchError(() => of(null)))
      .subscribe((d) => this.bankData.set(d));
  }

  protected addBank(): void {
    const ref = this.dialog.open<boolean | undefined>(BankAccountFormDialogComponent, {
      data: { mode: 'add' },
      panelClass: 'fk-dialog-panel',
      width: 'min(560px, 95vw)',
      autoFocus: 'dialog',
    });
    ref.closed.subscribe((changed) => {
      if (changed) this.refreshBanks();
    });
  }

  protected editBank(acc: PartnerBankAccount): void {
    const ref = this.dialog.open<boolean | undefined>(BankAccountFormDialogComponent, {
      data: { mode: 'edit', account: acc },
      panelClass: 'fk-dialog-panel',
      width: 'min(560px, 95vw)',
      autoFocus: 'dialog',
    });
    ref.closed.subscribe((changed) => {
      if (changed) this.refreshBanks();
    });
  }

  protected makePrimary(acc: PartnerBankAccount): void {
    this.api.makePrimary(acc.id).subscribe({
      next: () => {
        this.notifications.success(`${acc.nickname} is now your primary account.`);
        this.refreshBanks();
      },
      error: (err) => this.notifications.error(err?.message ?? 'Could not update primary.'),
    });
  }

  protected async deleteBank(acc: PartnerBankAccount): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${acc.nickname}"?`,
      message: 'The account will be removed. In-flight withdrawals are not affected.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const pwd = window.prompt('Please re-enter your password to confirm deletion.');
    if (!pwd) return;
    this.api.deleteBankAccount(acc.id, pwd).subscribe({
      next: () => {
        this.notifications.success('Bank account deleted.');
        this.refreshBanks();
      },
      error: (err) => this.notifications.error(err?.message ?? 'Could not delete.'),
    });
  }

  protected tone(status: PartnerBankAccount['verificationStatus']): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING_VERIFICATION':
        return 'warning';
      case 'FAILED':
        return 'danger';
    }
  }
  protected statusLabel(status: PartnerBankAccount['verificationStatus']): string {
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
