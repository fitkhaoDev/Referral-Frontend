import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, defer, of, tap } from 'rxjs';
import { toMajorUnits } from '@core/models/money.model';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import { PartnerBankAccount, PartnerWalletSummary } from '../../models/finance.model';

/**
 * Manual-approval withdrawal flow:
 *   - Partner picks one of their verified bank accounts (default is pre-selected).
 *   - Amount deducted from available → heldForWithdrawal on submission.
 *   - Request lands in admin queue; admin reviews, pays manually, and marks
 *     SUCCESS (hold → withdrawn) or FAILED (hold → available).
 *
 * NOTE: the earlier vendor/UPI-based auto-payout flow is intentionally not
 * invoked here; dialog code is kept but UPI selection is paused.
 */
@Component({
  selector: 'app-withdraw-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './withdraw-dialog.component.html',
  styleUrl: './withdraw-dialog.component.css',
})
export class WithdrawDialogComponent {
  private readonly dialogRef = inject<DialogRef<string | undefined>>(DialogRef);
  private readonly api = inject(PartnerFinanceApi);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  protected readonly wallet = toSignal(
    defer(() => this.api.wallet()).pipe(catchError(() => of(null as PartnerWalletSummary | null))),
    { initialValue: null },
  );
  protected readonly banks = toSignal(
    defer(() => this.api.listBankAccounts()).pipe(
      tap((d) => this.hydrateDefault(d.accounts)),
      catchError(() => of({ accounts: [], monthlyAddEditCount: 0, monthlyAddEditLimit: 3 })),
    ),
    { initialValue: null },
  );

  // Manual-approval flow: always credits to the default bank account. We only
  // surface the primary (default) one; partners switch the default from the
  // Profile page if they want to withdraw to a different account.
  protected readonly defaultBank = computed<PartnerBankAccount | null>(() => {
    const accounts = this.banks()?.accounts ?? [];
    return accounts.find((a) => a.isPrimary) ?? accounts[0] ?? null;
  });
  protected readonly hasBanks = computed(() => this.defaultBank() !== null);

  protected readonly form = this.fb.nonNullable.group({
    bankAccountId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    requesterNote: [''],
  });

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  private hydrateDefault(accounts: readonly PartnerBankAccount[]): void {
    if (this.form.controls.bankAccountId.value) return;
    const primary = accounts.find((a) => a.isPrimary);
    const pick = primary ?? accounts[0];
    if (pick) this.form.patchValue({ bankAccountId: pick.id });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.api
      .createWithdrawalRequest({
        amount: Number(value.amount),
        bankAccountId: value.bankAccountId,
        requesterNote: value.requesterNote?.trim() || undefined,
      })
      .subscribe({
        next: (row) => {
          this.submitting.set(false);
          this.notifications.success(
            `Withdrawal request ${row.requestId} raised. Admin will review and transfer.`,
          );
          this.dialogRef.close(row.id);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Could not raise the request.');
        },
      });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected readonly majorUnits = (m?: { minorUnits: number } | null) =>
    m ? toMajorUnits(m as any) : 0;
}
