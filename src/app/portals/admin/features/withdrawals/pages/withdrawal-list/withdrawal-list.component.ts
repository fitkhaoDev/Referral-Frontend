import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortSpec } from '@core/models/api.model';
import { StatusTone } from '@shared/components/status-badge/status-badge.component';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { WithdrawalsOptionsService } from '../../data-access/withdrawals-options.service';
import {
  WITHDRAWAL_BENEFICIARY_TYPE_LABEL,
  WITHDRAWAL_STATUS_LABEL,
  Withdrawal,
  WithdrawalBeneficiaryType,
  WithdrawalStatus,
} from '../../models/withdrawal.model';
import { WithdrawalsFacade } from '../../store/withdrawals.facade';
import { WITHDRAWAL_FILTER_KEYS, withdrawalsList } from '../../store/withdrawals.list';

export function withdrawalStatusTone(status: WithdrawalStatus): StatusTone {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'REQUESTED':
    case 'APPROVED':
    case 'PROCESSING':
      return 'warning';
    case 'FAILED':
    case 'REJECTED':
      return 'danger';
    default:
      return 'neutral';
  }
}

@Component({
  selector: 'app-withdrawal-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './withdrawal-list.component.html',
  styleUrl: './withdrawal-list.component.css',
})
export class WithdrawalListComponent {
  protected readonly facade = inject(WithdrawalsFacade);
  private readonly router = inject(Router);

  protected readonly organisationOptions = toSignal(
    inject(WithdrawalsOptionsService).organisationOptions$,
    { initialValue: [] as SelectOption[] },
  );

  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly beneficiaryFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly organisationFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly fromDate = new FormControl<string>('', { nonNullable: true });
  protected readonly toDate = new FormControl<string>('', { nonNullable: true });

  protected readonly statusOptions: SelectOption[] = (
    [
      'REQUESTED',
      'APPROVED',
      'PROCESSING',
      'PAID',
      'FAILED',
      'REJECTED',
      'CANCELLED',
    ] as WithdrawalStatus[]
  ).map((v) => ({ value: v, label: WITHDRAWAL_STATUS_LABEL[v] }));
  protected readonly beneficiaryOptions: SelectOption[] = (
    ['PARTNER', 'ORGANISATION', 'DOCTOR'] as WithdrawalBeneficiaryType[]
  ).map((v) => ({ value: v, label: WITHDRAWAL_BENEFICIARY_TYPE_LABEL[v] }));

  protected readonly columns: TableColumn<Withdrawal>[] = [
    { key: 'reference', header: 'Reference', sortable: true, primary: true, value: (r) => r.reference },
    { key: 'beneficiary', header: 'Beneficiary', primary: true, value: (r) => this.beneficiaryName(r) },
    { key: 'beneficiaryType', header: 'Type', hideOnMobile: true, value: (r) => WITHDRAWAL_BENEFICIARY_TYPE_LABEL[r.beneficiaryType] },
    { key: 'amount', header: 'Amount', sortable: true, align: 'end' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'requestedAt', header: 'Requested', sortable: true },
  ];

  protected readonly rowId = (row: Withdrawal): string => row.id;
  protected readonly statusTone = withdrawalStatusTone;

  constructor() {
    this.facade.loadPolicy();
    connectListToUrl(withdrawalsList, { filterKeys: WITHDRAWAL_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.statusFilter, f.status ?? '');
      this.sync(this.beneficiaryFilter, f.beneficiaryType ?? '');
      this.sync(this.organisationFilter, f.organisationId ?? '');
      this.sync(this.fromDate, f.fromDate ?? '');
      this.sync(this.toDate, f.toDate ?? '');
    });

    for (const c of [
      this.statusFilter,
      this.beneficiaryFilter,
      this.organisationFilter,
      this.fromDate,
      this.toDate,
    ]) {
      c.valueChanges.subscribe(() => this.push());
    }
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }
  private push(): void {
    this.facade.setFilters({
      status: (this.statusFilter.value || undefined) as WithdrawalStatus | undefined,
      beneficiaryType: (this.beneficiaryFilter.value || undefined) as
        | WithdrawalBeneficiaryType
        | undefined,
      organisationId: this.organisationFilter.value || undefined,
      fromDate: this.fromDate.value || undefined,
      toDate: this.toDate.value || undefined,
    });
  }

  protected beneficiaryName(r: Withdrawal): string {
    if (r.beneficiaryType === 'DOCTOR') return r.memberName ?? '—';
    if (r.beneficiaryType === 'ORGANISATION') return r.organisationName ?? '—';
    return r.partnerName ?? '—';
  }
  protected statusLabelOf(r: Withdrawal): string {
    return WITHDRAWAL_STATUS_LABEL[r.status];
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

  protected view(row: Withdrawal): void {
    void this.router.navigate(['/admin/withdrawals', row.id]);
  }
}
