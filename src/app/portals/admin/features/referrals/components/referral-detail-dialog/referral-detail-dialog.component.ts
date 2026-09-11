import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Referral, REFERRAL_COMMISSION_STATUS_LABEL } from '../../models/referral.model';

/** Read-only detail view for a single referral event occurrence. */
@Component({
  selector: 'app-referral-detail-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './referral-detail-dialog.component.html',
  styleUrl: './referral-detail-dialog.component.css',
})
export class ReferralDetailDialogComponent {
  protected readonly referral = inject<{ referral: Referral }>(DIALOG_DATA).referral;
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);

  protected readonly commissionStatusLabel = REFERRAL_COMMISSION_STATUS_LABEL;

  protected commissionTone(status: Referral['commissionStatus']): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REVERSED':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
