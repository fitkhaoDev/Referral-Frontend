import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  COMMISSION_STATUS_LABEL,
  Commission,
  INCENTIVE_TYPE_LABEL,
} from '../../models/commission.model';

/** Read-only detail for a single commission, with its immutable rule snapshot. */
@Component({
  selector: 'app-commission-detail-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './commission-detail-dialog.component.html',
  styleUrl: './commission-detail-dialog.component.css',
})
export class CommissionDetailDialogComponent {
  protected readonly commission = inject<{ commission: Commission }>(DIALOG_DATA).commission;
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);

  // Read label maps in methods, never in field initializers — a cross-module const
  // map can be `undefined` at field-init time depending on chunk load order.
  protected statusLabelOf(status: Commission['status']): string {
    return COMMISSION_STATUS_LABEL[status];
  }
  protected incentiveTypeLabelOf(type: Commission['ruleSnapshot']['incentiveType']): string {
    return INCENTIVE_TYPE_LABEL[type];
  }

  protected statusTone(
    status: Commission['status'],
  ): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REVERSED':
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  protected beneficiaryName(): string {
    const c = this.commission;
    if (c.beneficiaryType === 'DOCTOR') return c.memberName ?? '—';
    if (c.beneficiaryType === 'ORGANISATION') return c.organisationName ?? '—';
    return c.partnerName ?? '—';
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
