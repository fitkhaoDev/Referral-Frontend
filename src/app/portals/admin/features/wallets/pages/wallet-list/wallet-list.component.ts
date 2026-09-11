import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SortSpec } from '@core/models/api.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import {
  WALLET_OWNER_TYPE_LABEL,
  WalletOwnerType,
  WalletSummary,
} from '../../models/wallet.model';
import { WalletsFacade } from '../../store/wallets.facade';
import { WALLET_FILTER_KEYS, walletsList } from '../../store/wallets.list';

@Component({
  selector: 'app-wallet-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-list.component.html',
  styleUrl: './wallet-list.component.css',
})
export class WalletListComponent {
  protected readonly facade = inject(WalletsFacade);
  private readonly router = inject(Router);

  protected readonly ownerTypeFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly ownerTypeOptions: SelectOption[] = (
    ['PARTNER', 'ORGANISATION', 'DOCTOR'] as WalletOwnerType[]
  ).map((v) => ({ value: v, label: WALLET_OWNER_TYPE_LABEL[v] }));

  protected readonly columns: TableColumn<WalletSummary>[] = [
    { key: 'ownerName', header: 'Owner', sortable: true, primary: true, value: (r) => r.ownerName },
    { key: 'ownerType', header: 'Type', primary: true, value: (r) => WALLET_OWNER_TYPE_LABEL[r.ownerType] },
    { key: 'ownerRef', header: 'Reference', hideOnMobile: true, value: (r) => r.ownerRef },
    { key: 'available', header: 'Available', sortable: true, align: 'end' },
    { key: 'pending', header: 'Pending', sortable: true, align: 'end' },
    { key: 'outstandingRecovery', header: 'Recovery due', align: 'end' },
    { key: 'lastActivityAt', header: 'Last activity', sortable: true },
  ];

  protected readonly rowId = (row: WalletSummary): string => row.id;

  constructor() {
    connectListToUrl(walletsList, { filterKeys: WALLET_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.ownerTypeFilter, f.ownerType ?? '');
    });

    this.ownerTypeFilter.valueChanges.subscribe(() =>
      this.facade.setFilters({
        ownerType: (this.ownerTypeFilter.value || undefined) as WalletOwnerType | undefined,
      }),
    );
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }

  protected onSort(sort: SortSpec[]): void {
    this.facade.setSort(sort);
  }
  protected onPage(event: { page: number; size: number }): void {
    this.facade.setPage(event.page, event.size);
  }
  protected onSearch(search: string): void {
    this.facade.setSearch(search);
  }
  protected onClearFilters(): void {
    this.facade.clearFilters();
  }

  protected view(row: WalletSummary): void {
    void this.router.navigate(['/admin/wallet', row.id]);
  }
}
