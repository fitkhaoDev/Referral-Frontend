import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SortSpec } from '@core/models/api.model';
import { Money } from '@core/models/money.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { StatusTone } from '@shared/components/status-badge/status-badge.component';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { WalletTransactionDialogComponent } from '../../components/wallet-transaction-dialog/wallet-transaction-dialog.component';
import {
  WALLET_OWNER_TYPE_LABEL,
  WALLET_TRANSACTION_STATUS_LABEL,
  WALLET_TRANSACTION_TYPE_LABEL,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../../models/wallet.model';
import { WalletsFacade } from '../../store/wallets.facade';

interface SummaryCard {
  readonly key: string;
  readonly label: string;
  readonly value: () => Money | undefined;
  readonly hint: string;
  readonly emphasis?: boolean;
}

@Component({
  selector: 'app-wallet-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-detail.component.html',
  styleUrl: './wallet-detail.component.css',
})
export class WalletDetailComponent implements OnDestroy {
  protected readonly facade = inject(WalletsFacade);
  private readonly dialog = inject(Dialog);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly ownerTypeLabel = WALLET_OWNER_TYPE_LABEL;

  protected readonly typeFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly fromDate = new FormControl<string>('', { nonNullable: true });
  protected readonly toDate = new FormControl<string>('', { nonNullable: true });

  protected readonly typeOptions: SelectOption[] = (
    [
      'COUNSELLING_INCENTIVE',
      'FIRST_PURCHASE_INCENTIVE',
      'RENEWAL_INCENTIVE',
      'WITHDRAWAL',
      'REVERSAL',
      'RECOVERY',
      'ADJUSTMENT',
    ] as WalletTransactionType[]
  ).map((v) => ({ value: v, label: WALLET_TRANSACTION_TYPE_LABEL[v] }));

  protected readonly statusOptions: SelectOption[] = (
    ['PENDING', 'AVAILABLE', 'PAID', 'RECOVERED', 'REVERSED'] as WalletTransactionStatus[]
  ).map((v) => ({ value: v, label: WALLET_TRANSACTION_STATUS_LABEL[v] }));

  protected readonly cards: SummaryCard[] = [
    {
      key: 'totalEarned',
      label: 'Total earned',
      value: () => this.facade.summary()?.totalEarned,
      hint: 'Lifetime incentives credited, before any withdrawal or reversal.',
    },
    {
      key: 'available',
      label: 'Available to withdraw',
      value: () => this.facade.summary()?.available,
      hint: 'Cleared balance the owner can request a withdrawal against.',
      emphasis: true,
    },
    {
      key: 'pending',
      label: 'Pending',
      value: () => this.facade.summary()?.pending,
      hint: 'Credited but still in the holding period — not yet withdrawable.',
    },
    {
      key: 'withdrawn',
      label: 'Withdrawn',
      value: () => this.facade.summary()?.withdrawn,
      hint: 'Total paid out across all completed withdrawals.',
    },
    {
      key: 'reversed',
      label: 'Reversed',
      value: () => this.facade.summary()?.reversed,
      hint: 'Commissions clawed back — each is a separate debit row in the ledger.',
    },
    {
      key: 'outstandingRecovery',
      label: 'Recovery outstanding',
      value: () => this.facade.summary()?.outstandingRecovery,
      hint: 'Reversed amount not yet recovered; deducted from future incentives.',
    },
  ];

  protected readonly columns: TableColumn<WalletTransaction>[] = [
    { key: 'reference', header: 'Reference', primary: true, value: (r) => r.reference },
    { key: 'type', header: 'Type', sortable: true, primary: true, value: (r) => WALLET_TRANSACTION_TYPE_LABEL[r.type] },
    { key: 'customerRef', header: 'Customer', hideOnMobile: true, value: (r) => r.customerRef ?? '—' },
    { key: 'amount', header: 'Amount', sortable: true, align: 'end' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'occurredAt', header: 'Date & time', sortable: true },
  ];

  protected readonly rowId = (row: WalletTransaction): string => row.id;

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      this.facade.loadSummary(id);
      this.facade.openLedger(id);
    });

    effect(() => {
      const f = this.facade.ledgerFilters();
      this.sync(this.typeFilter, f.type ?? '');
      this.sync(this.statusFilter, f.status ?? '');
      this.sync(this.fromDate, f.fromDate ?? '');
      this.sync(this.toDate, f.toDate ?? '');
    });

    for (const c of [this.typeFilter, this.statusFilter, this.fromDate, this.toDate]) {
      c.valueChanges.subscribe(() => this.push());
    }
  }

  ngOnDestroy(): void {
    this.facade.clearDetail();
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }
  private push(): void {
    this.facade.setLedgerFilters({
      type: (this.typeFilter.value || undefined) as WalletTransactionType | undefined,
      status: (this.statusFilter.value || undefined) as WalletTransactionStatus | undefined,
      fromDate: this.fromDate.value || undefined,
      toDate: this.toDate.value || undefined,
    });
  }

  protected typeLabelOf(row: WalletTransaction): string {
    return WALLET_TRANSACTION_TYPE_LABEL[row.type];
  }
  protected statusLabelOf(row: WalletTransaction): string {
    return WALLET_TRANSACTION_STATUS_LABEL[row.status];
  }
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

  protected onLedgerSort(sort: SortSpec[]): void {
    this.facade.setLedgerSort(sort);
  }
  protected onLedgerPage(event: { page: number; size: number }): void {
    this.facade.setLedgerPage(event.page, event.size);
  }
  protected onLedgerSearch(search: string): void {
    this.facade.setLedgerSearch(search);
  }
  protected onClearLedgerFilters(): void {
    this.facade.clearLedgerFilters();
  }

  protected openTransaction(row: WalletTransaction): void {
    this.dialog.open(WalletTransactionDialogComponent, {
      data: { transaction: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }
}
