import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/notifications/notification.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { BankAccountFormDialogComponent } from '../../components/bank-account-form-dialog/bank-account-form-dialog.component';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import { PartnerBankAccount, PartnerBankAccountList } from '../../models/finance.model';

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

  protected readonly reloadTick = signal(0);
  protected readonly data = signal<PartnerBankAccountList | null>(null);

  private readonly _bootstrap = toSignal(
    this.api.listBankAccounts().pipe(
      tap((d) => this.data.set(d)),
      catchError(() => of(null)),
    ),
    { initialValue: null },
  );

  protected refresh(): void {
    this.api
      .listBankAccounts()
      .pipe(catchError(() => of(null)))
      .subscribe((d) => this.data.set(d));
  }

  protected add(): void {
    const ref = this.dialog.open<boolean | undefined>(BankAccountFormDialogComponent, {
      data: { mode: 'add' },
      panelClass: 'fk-dialog-panel',
      width: 'min(560px, 95vw)',
      autoFocus: 'dialog',
    });
    ref.closed.subscribe((changed) => {
      if (changed) this.refresh();
    });
  }

  protected edit(acc: PartnerBankAccount): void {
    const ref = this.dialog.open<boolean | undefined>(BankAccountFormDialogComponent, {
      data: { mode: 'edit', account: acc },
      panelClass: 'fk-dialog-panel',
      width: 'min(560px, 95vw)',
      autoFocus: 'dialog',
    });
    ref.closed.subscribe((changed) => {
      if (changed) this.refresh();
    });
  }

  protected makePrimary(acc: PartnerBankAccount): void {
    this.api.makePrimary(acc.id).subscribe({
      next: () => {
        this.notifications.success(`${acc.nickname} is now your primary account.`);
        this.refresh();
      },
      error: (err) => this.notifications.error(err?.message ?? 'Could not update primary.'),
    });
  }

  protected async delete(acc: PartnerBankAccount): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${acc.nickname}"?`,
      message: 'The account will be removed. In-flight withdrawals are not affected.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    // For deletion we also need current password — prompt via another small flow.
    const pwd = window.prompt('Please re-enter your password to confirm deletion.');
    if (!pwd) return;
    this.api.deleteBankAccount(acc.id, pwd).subscribe({
      next: () => {
        this.notifications.success('Bank account deleted.');
        this.refresh();
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
