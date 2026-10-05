import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, defer, of, switchMap, tap } from 'rxjs';
import { toMajorUnits } from '@core/models/money.model';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import {
  PartnerBankAccount,
  PartnerWalletSummary,
  WithdrawalQuote,
} from '../../models/finance.model';

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
      catchError(() => of({ accounts: [], monthlyAddEditCount: 0, monthlyAddEditLimit: 3 })),
    ),
    { initialValue: null },
  );

  protected readonly verifiedBanks = computed<PartnerBankAccount[]>(() =>
    (this.banks()?.accounts ?? []).filter((b) => b.verificationStatus === 'VERIFIED'),
  );

  protected readonly form = this.fb.nonNullable.group({
    bankAccountId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
  });

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly quote = signal<WithdrawalQuote | null>(null);
  protected readonly quoteLoading = signal(false);

  constructor() {
    // Default to primary verified account.
    toSignal(
      defer(() => this.api.listBankAccounts()).pipe(
        tap((list) => {
          const primary = list.accounts.find(
            (a) => a.isPrimary && a.verificationStatus === 'VERIFIED',
          );
          const fallback = list.accounts.find((a) => a.verificationStatus === 'VERIFIED');
          const pick = primary ?? fallback;
          if (pick) this.form.patchValue({ bankAccountId: pick.id });
        }),
        catchError(() => of(null)),
      ),
      { initialValue: null },
    );

    this.form.controls.amount.valueChanges
      .pipe(
        tap(() => this.error.set(null)),
        switchMap((amount) => {
          const n = Number(amount);
          if (!Number.isFinite(n) || n <= 0) {
            this.quote.set(null);
            return of(null);
          }
          this.quoteLoading.set(true);
          return this.api.quote(n).pipe(
            catchError(() => of(null)),
            tap(() => this.quoteLoading.set(false)),
          );
        }),
      )
      .subscribe((q) => {
        this.quote.set(q);
      });
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
      .requestWithdrawal({ amount: Number(value.amount), bankAccountId: value.bankAccountId })
      .subscribe({
        next: (row) => {
          this.submitting.set(false);
          this.notifications.success(`Withdrawal of ₹${value.amount} initiated.`);
          this.dialogRef.close(row.id);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.message ?? 'Could not initiate withdrawal.');
        },
      });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected readonly majorUnits = (m?: { minorUnits: number } | null) =>
    m ? toMajorUnits(m as any) : 0;
}
