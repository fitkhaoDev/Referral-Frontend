import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, defer, of, startWith, switchMap, tap } from 'rxjs';
import { toMajorUnits } from '@core/models/money.model';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import {
  PartnerBankAccount,
  PartnerUpi,
  PartnerWalletSummary,
  WithdrawalDestinationType,
  WithdrawalQuote,
} from '../../models/finance.model';

/** NPCI per-txn UPI cap — backend enforces too, UI mirrors for better UX. */
const UPI_MAX_RUPEES = 100_000;

interface DestinationOption {
  readonly type: WithdrawalDestinationType;
  readonly id: string;
  readonly label: string;
  readonly isPrimary: boolean;
}

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
  protected readonly upis = toSignal(
    defer(() => this.api.listUpi()).pipe(
      catchError(() => of({ accounts: [], monthlyAddEditCount: 0, monthlyAddEditLimit: 3 })),
    ),
    { initialValue: null },
  );

  protected readonly verifiedBanks = computed<PartnerBankAccount[]>(() =>
    (this.banks()?.accounts ?? []).filter((b) => b.verificationStatus === 'VERIFIED'),
  );
  protected readonly verifiedUpis = computed<PartnerUpi[]>(() =>
    (this.upis()?.accounts ?? []).filter((u) => u.verificationStatus === 'VERIFIED'),
  );

  protected readonly destinations = computed<DestinationOption[]>(() => {
    const bankOpts: DestinationOption[] = this.verifiedBanks().map((b) => ({
      type: 'BANK',
      id: b.id,
      label: `${b.nickname} — ${b.bankName} ••••${b.accountNumberLast4}`,
      isPrimary: b.isPrimary,
    }));
    const upiOpts: DestinationOption[] = this.verifiedUpis().map((u) => ({
      type: 'UPI',
      id: u.id,
      label: `${u.nickname} — ${u.vpa}`,
      isPrimary: u.isPrimary,
    }));
    return [...bankOpts, ...upiOpts];
  });

  protected readonly hasDestinations = computed(() => this.destinations().length > 0);

  protected readonly form = this.fb.nonNullable.group({
    destinationType: ['BANK' as WithdrawalDestinationType, Validators.required],
    destinationId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
  });

  /** Options filtered by the currently-selected destinationType. */
  protected readonly filteredDestinations = computed<DestinationOption[]>(() => {
    const type = this.selectedType();
    return this.destinations().filter((d) => d.type === type);
  });

  private readonly selectedType = toSignal(
    this.form.controls.destinationType.valueChanges.pipe(
      startWith(this.form.controls.destinationType.value),
    ),
    { initialValue: this.form.controls.destinationType.value },
  );

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly quote = signal<WithdrawalQuote | null>(null);
  protected readonly quoteLoading = signal(false);

  protected readonly isUpi = computed(() => this.selectedType() === 'UPI');
  protected readonly upiCapExceeded = computed(
    () => this.isUpi() && Number(this.form.controls.amount.value) > UPI_MAX_RUPEES,
  );
  protected readonly upiCapRupees = UPI_MAX_RUPEES;

  constructor() {
    // Pick a default destination once both lists have loaded. Prefer the primary
    // of whichever list has one; bank wins the tie-break for backwards compat.
    toSignal(
      defer(() => this.api.listBankAccounts()).pipe(
        tap((bankList) => {
          this.upis(); // trigger subscription
          const primaryBank = bankList.accounts.find(
            (a) => a.isPrimary && a.verificationStatus === 'VERIFIED',
          );
          const fallbackBank = bankList.accounts.find((a) => a.verificationStatus === 'VERIFIED');
          const pick = primaryBank ?? fallbackBank;
          if (pick) {
            this.form.patchValue({ destinationType: 'BANK', destinationId: pick.id });
          }
        }),
        catchError(() => of(null)),
      ),
      { initialValue: null },
    );

    // When destinationType flips, auto-select first option of the new list and
    // clear the stale id so the submit button stays disabled until the user
    // picks (or we auto-pick primary).
    this.form.controls.destinationType.valueChanges.subscribe(() => {
      const first =
        this.filteredDestinations().find((d) => d.isPrimary) ?? this.filteredDestinations()[0];
      this.form.patchValue({ destinationId: first?.id ?? '' });
      // Re-fetch quote with the new destination tier (UPI has a different fee).
      const amt = Number(this.form.controls.amount.value);
      if (Number.isFinite(amt) && amt > 0) this.refreshQuote(amt);
    });

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
          return this.api.quote(n, this.form.controls.destinationType.value).pipe(
            catchError(() => of(null)),
            tap(() => this.quoteLoading.set(false)),
          );
        }),
      )
      .subscribe((q) => this.quote.set(q));
  }

  private refreshQuote(amount: number): void {
    this.quoteLoading.set(true);
    this.api
      .quote(amount, this.form.controls.destinationType.value)
      .pipe(catchError(() => of(null)))
      .subscribe((q) => {
        this.quote.set(q);
        this.quoteLoading.set(false);
      });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.upiCapExceeded()) {
      this.error.set(`UPI payouts are capped at ₹${UPI_MAX_RUPEES.toLocaleString('en-IN')} per transaction.`);
      return;
    }
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.api
      .requestWithdrawal({
        amount: Number(value.amount),
        destinationType: value.destinationType,
        destinationId: value.destinationId,
      })
      .subscribe({
        next: (row) => {
          this.submitting.set(false);
          this.notifications.success(`Withdrawal of ₹${value.amount} initiated.`);
          this.dialogRef.close(row.id);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Could not initiate withdrawal.');
        },
      });
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected readonly majorUnits = (m?: { minorUnits: number } | null) =>
    m ? toMajorUnits(m as any) : 0;
}
