import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, input, signal } from '@angular/core';
import { ButtonVariant } from '@shared/components/button/button.component';
import { NotificationService } from '@core/notifications/notification.service';
import { DevWithdrawalSimulatorService } from '../../data-access/dev-withdrawal-simulator.service';
import { WithdrawalActionDialogComponent } from '../../components/withdrawal-action-dialog/withdrawal-action-dialog.component';
import {
  WITHDRAWAL_ACTION_LABEL,
  WITHDRAWAL_BENEFICIARY_TYPE_LABEL,
  WITHDRAWAL_PAYOUT_METHOD_LABEL,
  WITHDRAWAL_STATUS_LABEL,
  Withdrawal,
  WithdrawalAction,
  WithdrawalBeneficiaryType,
  WithdrawalPayoutMethod,
  WithdrawalStatus,
} from '../../models/withdrawal.model';
import { WithdrawalsFacade } from '../../store/withdrawals.facade';
import { withdrawalStatusTone } from '../withdrawal-list/withdrawal-list.component';

const ACTION_VARIANT: Record<WithdrawalAction, ButtonVariant> = {
  APPROVE: 'primary',
  MARK_PROCESSING: 'primary',
  MARK_PAID: 'primary',
  REJECT: 'danger',
  MARK_FAILED: 'danger',
  RETRY: 'primary',
};

@Component({
  selector: 'app-withdrawal-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './withdrawal-detail.component.html',
  styleUrl: './withdrawal-detail.component.css',
})
export class WithdrawalDetailComponent implements OnDestroy {
  protected readonly facade = inject(WithdrawalsFacade);
  private readonly dialog = inject(Dialog);
  private readonly simulator = inject(DevWithdrawalSimulatorService);
  private readonly notifications = inject(NotificationService);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly statusTone = withdrawalStatusTone;

  /** True in dev/test builds — hides the simulator buttons in production. */
  protected readonly simulatorAvailable = this.simulator.isAvailable;
  protected readonly simulating = signal<'PAID' | 'FAILED' | null>(null);

  // Label maps are read in methods, not field initializers — a cross-module const
  // map can be `undefined` at field-init time depending on chunk load order.
  protected statusLabelOf(status: WithdrawalStatus): string {
    return WITHDRAWAL_STATUS_LABEL[status];
  }
  protected beneficiaryTypeLabelOf(type: WithdrawalBeneficiaryType): string {
    return WITHDRAWAL_BENEFICIARY_TYPE_LABEL[type];
  }
  protected payoutMethodLabelOf(method: WithdrawalPayoutMethod): string {
    return WITHDRAWAL_PAYOUT_METHOD_LABEL[method];
  }
  protected actionLabelOf(action: WithdrawalAction): string {
    return WITHDRAWAL_ACTION_LABEL[action];
  }

  constructor() {
    this.facade.loadPolicy();
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
  }

  ngOnDestroy(): void {
    this.facade.clearDetail();
  }

  protected beneficiaryName(w: Withdrawal): string {
    if (w.beneficiaryType === 'DOCTOR') return w.memberName ?? '—';
    if (w.beneficiaryType === 'ORGANISATION') return w.organisationName ?? '—';
    return w.partnerName ?? '—';
  }

  protected actionVariant(action: WithdrawalAction): ButtonVariant {
    return ACTION_VARIANT[action];
  }

  protected runAction(action: WithdrawalAction): void {
    const withdrawal = this.facade.detail();
    if (!withdrawal) return;
    this.dialog.open(WithdrawalActionDialogComponent, {
      data: { withdrawal, action },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  /** DEV ONLY: simulate the RazorpayX webhook so testers can settle a
   *  withdrawal without computing an HMAC or exposing localhost. */
  protected simulate(state: 'PAID' | 'FAILED'): void {
    const withdrawal = this.facade.detail();
    if (!withdrawal) return;
    const confirmed = window.confirm(
      `Simulate ${state} webhook for ${withdrawal.reference}? This is a TEST action and will change wallet balances.`,
    );
    if (!confirmed) return;

    this.simulating.set(state);
    this.simulator.simulate(withdrawal.id, state).subscribe({
      next: (res) => {
        this.simulating.set(null);
        if (res.idempotent) {
          this.notifications.info(`Already ${res.withdrawal?.status ?? state}.`);
        } else {
          this.notifications.success(
            state === 'PAID' ? 'Marked PAID — wallet credited.' : 'Marked FAILED — wallet rolled back.',
          );
        }
        this.facade.loadDetail(withdrawal.id);
      },
      error: (err) => {
        this.simulating.set(null);
        this.notifications.error(err?.error?.message ?? err?.message ?? 'Simulation failed.');
      },
    });
  }
}
