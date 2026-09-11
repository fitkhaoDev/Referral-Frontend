import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { WITHDRAWAL_ACTION_LABEL, WithdrawalAction } from '../../models/withdrawal.model';
import { WithdrawalActions } from '../../store/withdrawals.actions';
import { WithdrawalsFacade } from '../../store/withdrawals.facade';
import { WithdrawalActionDialogData } from './withdrawal-action-dialog.model';

/**
 * One dialog for every admin withdrawal action. Reason text is required for REJECT
 * and MARK_FAILED; a payment reference is required for MARK_PAID; APPROVE and
 * MARK_PROCESSING are plain confirmations. The backend still validates and can
 * reject the transition (409) or the input (422).
 */
@Component({
  selector: 'app-withdrawal-action-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './withdrawal-action-dialog.component.html',
  styleUrl: './withdrawal-action-dialog.component.css',
})
export class WithdrawalActionDialogComponent {
  protected readonly data = inject<WithdrawalActionDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly facade = inject(WithdrawalsFacade);
  private readonly actions$ = inject(Actions);

  protected readonly action = this.data.action;
  protected readonly withdrawal = this.data.withdrawal;

  // Getters, not field initializers — a cross-module const map can be `undefined`
  // at field-init time depending on chunk load order.
  protected get actionLabel(): string {
    return WITHDRAWAL_ACTION_LABEL[this.action];
  }
  protected get title(): string {
    return `${this.actionLabel} ${this.withdrawal.reference}`;
  }

  protected readonly needsReason = this.action === 'REJECT' || this.action === 'MARK_FAILED';
  protected readonly needsPaymentRef = this.action === 'MARK_PAID';

  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: this.needsReason ? [Validators.required, Validators.maxLength(500)] : [],
  });
  protected readonly paymentReference = new FormControl('', {
    nonNullable: true,
    validators: this.needsPaymentRef ? [Validators.required, Validators.maxLength(64)] : [],
  });

  protected readonly acting = this.facade.acting;
  private readonly actionError = this.facade.actionError;

  protected readonly confirmTone: 'primary' | 'danger' =
    this.action === 'APPROVE' || this.action === 'MARK_PROCESSING' || this.action === 'MARK_PAID'
      ? 'primary'
      : 'danger';

  private static readonly BODY: Record<WithdrawalAction, string> = {
    APPROVE: 'Approve this payout request. It moves to the processing queue next.',
    MARK_PROCESSING: 'Mark this withdrawal as being processed by the payout provider.',
    MARK_PAID: 'Confirm the payout has settled and record its bank/UPI reference.',
    REJECT: 'Reject this request. The beneficiary keeps their balance and can request again.',
    MARK_FAILED: 'Record that the payout failed. It can be moved back to processing to retry.',
  };
  protected readonly bodyText = WithdrawalActionDialogComponent.BODY[this.action];

  constructor() {
    this.facade.clearActionError();

    effect(() => {
      const err = this.actionError();
      if (!err?.fieldErrors) return;
      const reasonErr = err.fieldErrors['reason']?.[0];
      const refErr = err.fieldErrors['paymentReference']?.[0];
      if (reasonErr) this.reason.setErrors({ server: reasonErr });
      if (refErr) this.paymentReference.setErrors({ server: refErr });
    });

    this.actions$
      .pipe(ofType(WithdrawalActions.actionSuccess), takeUntilDestroyed())
      .subscribe(() => this.dialogRef.close(true));
  }

  protected genericError(): string | null {
    const err = this.actionError();
    if (!err || err.status === 422) return null;
    return err.message;
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected submit(): void {
    const id = this.withdrawal.id;
    if (this.needsReason) {
      if (this.reason.invalid) {
        this.reason.markAsTouched();
        return;
      }
      const reason = this.reason.value.trim();
      if (this.action === 'REJECT') this.facade.reject(id, reason);
      else this.facade.markFailed(id, reason);
      return;
    }
    if (this.needsPaymentRef) {
      if (this.paymentReference.invalid) {
        this.paymentReference.markAsTouched();
        return;
      }
      this.facade.markPaid(id, this.paymentReference.value.trim());
      return;
    }
    if (this.action === 'APPROVE') this.facade.approve(id);
    else this.facade.markProcessing(id);
  }
}
