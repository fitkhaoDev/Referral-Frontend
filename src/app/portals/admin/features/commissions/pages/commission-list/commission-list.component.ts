import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortSpec } from '@core/models/api.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { CommissionDetailDialogComponent } from '../../components/commission-detail-dialog/commission-detail-dialog.component';
import { CommissionsOptionsService } from '../../data-access/commissions-options.service';
import {
  COMMISSION_STATUS_LABEL,
  Commission,
  CommissionBeneficiaryType,
  CommissionStatus,
  INCENTIVE_TYPE_LABEL,
  IncentiveType,
} from '../../models/commission.model';
import { CommissionsFacade } from '../../store/commissions.facade';
import { COMMISSION_FILTER_KEYS, commissionsList } from '../../store/commissions.list';

@Component({
  selector: 'app-commission-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './commission-list.component.html',
  styleUrl: './commission-list.component.css',
})
export class CommissionListComponent {
  protected readonly facade = inject(CommissionsFacade);
  private readonly dialog = inject(Dialog);
  private readonly options = inject(CommissionsOptionsService);

  protected readonly organisationOptions = toSignal(this.options.organisationOptions$, {
    initialValue: [] as SelectOption[],
  });
  protected readonly eventOptions = toSignal(this.options.eventOptions$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly fromDate = new FormControl<string>('', { nonNullable: true });
  protected readonly toDate = new FormControl<string>('', { nonNullable: true });
  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly beneficiaryFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly incentiveFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly organisationFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly eventFilter = new FormControl<string>('', { nonNullable: true });

  protected readonly statusOptions: SelectOption[] = (
    ['PENDING', 'AVAILABLE', 'WITHDRAWN', 'REVERSED', 'CANCELLED', 'FAILED'] as CommissionStatus[]
  ).map((v) => ({ value: v, label: COMMISSION_STATUS_LABEL[v] }));
  protected readonly beneficiaryOptions: SelectOption[] = (
    ['PARTNER', 'ORGANISATION', 'DOCTOR'] as CommissionBeneficiaryType[]
  ).map((v) => ({ value: v, label: v[0] + v.slice(1).toLowerCase() }));
  protected readonly incentiveOptions: SelectOption[] = (
    ['COUNSELLING', 'FIRST_PURCHASE', 'RENEWAL'] as IncentiveType[]
  ).map((v) => ({ value: v, label: INCENTIVE_TYPE_LABEL[v] }));

  protected readonly columns: TableColumn<Commission>[] = [
    { key: 'reference', header: 'Reference', sortable: true, primary: true, value: (r) => r.reference },
    { key: 'beneficiary', header: 'Beneficiary', primary: true, value: (r) => this.beneficiaryName(r) },
    { key: 'incentiveType', header: 'Incentive', value: (r) => INCENTIVE_TYPE_LABEL[r.ruleSnapshot.incentiveType] },
    { key: 'eventName', header: 'Event', hideOnMobile: true, value: (r) => r.eventName },
    { key: 'rule', header: 'Rule (snapshot)', hideOnMobile: true, value: (r) => `${r.ruleSnapshot.ruleId} v${r.ruleSnapshot.ruleVersion}` },
    { key: 'calculatedAmount', header: 'Amount', sortable: true, align: 'end' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'occurredAt', header: 'Date & time', sortable: true },
  ];

  protected readonly rowId = (row: Commission): string => row.id;

  constructor() {
    connectListToUrl(commissionsList, { filterKeys: COMMISSION_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.fromDate, f.fromDate ?? '');
      this.sync(this.toDate, f.toDate ?? '');
      this.sync(this.statusFilter, f.status ?? '');
      this.sync(this.beneficiaryFilter, f.beneficiaryType ?? '');
      this.sync(this.incentiveFilter, f.incentiveType ?? '');
      this.sync(this.organisationFilter, f.organisationId ?? '');
      this.sync(this.eventFilter, f.eventCode ?? '');
    });

    for (const c of [
      this.fromDate,
      this.toDate,
      this.statusFilter,
      this.beneficiaryFilter,
      this.incentiveFilter,
      this.organisationFilter,
      this.eventFilter,
    ]) {
      c.valueChanges.subscribe(() => this.push());
    }
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }
  private push(): void {
    this.facade.setFilters({
      fromDate: this.fromDate.value || undefined,
      toDate: this.toDate.value || undefined,
      status: (this.statusFilter.value || undefined) as CommissionStatus | undefined,
      beneficiaryType: (this.beneficiaryFilter.value || undefined) as
        | CommissionBeneficiaryType
        | undefined,
      incentiveType: (this.incentiveFilter.value || undefined) as IncentiveType | undefined,
      organisationId: this.organisationFilter.value || undefined,
      eventCode: this.eventFilter.value || undefined,
    });
  }

  protected beneficiaryName(r: Commission): string {
    if (r.beneficiaryType === 'DOCTOR') return r.memberName ?? '—';
    if (r.beneficiaryType === 'ORGANISATION') return r.organisationName ?? '—';
    return r.partnerName ?? '—';
  }

  protected statusLabelOf(r: Commission): string {
    return COMMISSION_STATUS_LABEL[r.status];
  }

  protected statusTone(status: CommissionStatus): 'success' | 'warning' | 'danger' | 'neutral' {
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

  protected openDetail(row: Commission): void {
    this.dialog.open(CommissionDetailDialogComponent, {
      data: { commission: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }
}
