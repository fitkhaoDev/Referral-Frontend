import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatusTone } from '@shared/components/status-badge/status-badge.component';
import {
  WALLET_TRANSACTION_STATUS_LABEL,
  WALLET_TRANSACTION_TYPE_LABEL,
  WalletTransaction,
  WalletTransactionStatus,
} from '../../models/wallet.model';

/** Read-only detail for a single wallet ledger entry. */
@Component({
  selector: 'app-wallet-transaction-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-transaction-dialog.component.html',
  styleUrl: './wallet-transaction-dialog.component.css',
})
export class WalletTransactionDialogComponent {
  protected readonly txn = inject<{ transaction: WalletTransaction }>(DIALOG_DATA).transaction;
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);

  protected readonly typeLabel = WALLET_TRANSACTION_TYPE_LABEL;
  protected readonly statusLabel = WALLET_TRANSACTION_STATUS_LABEL;

  protected statusTone(status: WalletTransactionStatus): StatusTone {
    switch (status) {
      case 'AVAILABLE':
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REVERSED':
        return 'danger';
      case 'RECOVERED':
        return 'info';
      default:
        return 'neutral';
    }
  }

  protected get isReversal(): boolean {
    return this.txn.type === 'REVERSAL';
  }
  protected get isRecovery(): boolean {
    return this.txn.type === 'RECOVERY';
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
