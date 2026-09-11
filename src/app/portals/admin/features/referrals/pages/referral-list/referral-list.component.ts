import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortSpec } from '@core/models/api.model';
import { PARTNER_CATEGORY_LABEL } from '@core/models/common.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { ReferralsOptionsService } from '../../data-access/referrals-options.service';
import { ReferralDetailDialogComponent } from '../../components/referral-detail-dialog/referral-detail-dialog.component';
import {
  REFERRAL_COMMISSION_STATUS_LABEL,
  Referral,
  ReferralCommissionStatus,
} from '../../models/referral.model';
import { ReferralsFacade } from '../../store/referrals.facade';
import { REFERRAL_FILTER_KEYS, referralsList } from '../../store/referrals.list';

@Component({
  selector: 'app-referral-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './referral-list.component.html',
  styleUrl: './referral-list.component.css',
})
export class ReferralListComponent {
  protected readonly facade = inject(ReferralsFacade);
  private readonly dialog = inject(Dialog);
  private readonly options = inject(ReferralsOptionsService);

  protected readonly organisationOptions = toSignal(this.options.organisationOptions$, {
    initialValue: [] as SelectOption[],
  });
  protected readonly eventOptions = toSignal(this.options.eventOptions$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly fromDate = new FormControl<string>('', { nonNullable: true });
  protected readonly toDate = new FormControl<string>('', { nonNullable: true });
  protected readonly categoryFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly organisationFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly eventFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly commissionFilter = new FormControl<string>('', { nonNullable: true });

  protected readonly categoryOptions: SelectOption[] = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'ORGANISATION', label: 'Organisation' },
  ];
  protected readonly commissionOptions: SelectOption[] = (
    ['PENDING', 'AVAILABLE', 'WITHDRAWN', 'REVERSED', 'NONE'] as ReferralCommissionStatus[]
  ).map((v) => ({ value: v, label: REFERRAL_COMMISSION_STATUS_LABEL[v] }));

  protected commissionLabelOf(row: Referral): string {
    return REFERRAL_COMMISSION_STATUS_LABEL[row.commissionStatus];
  }

  protected readonly columns: TableColumn<Referral>[] = [
    { key: 'reference', header: 'Reference', sortable: true, primary: true, value: (r) => r.reference },
    { key: 'customerRef', header: 'Customer', primary: true, value: (r) => r.customerRef },
    { key: 'source', header: 'Partner / organisation', value: (r) => this.sourceLabel(r) },
    { key: 'referringMemberName', header: 'Referred by', hideOnMobile: true, value: (r) => r.referringMemberName ?? '—' },
    { key: 'eventName', header: 'Event', sortable: true, value: (r) => r.eventName },
    { key: 'plan', header: 'Plan', hideOnMobile: true, value: (r) => r.plan ?? '—' },
    { key: 'planAmount', header: 'Plan amount', align: 'end' },
    { key: 'commissionAmount', header: 'Commission', sortable: true, align: 'end' },
    { key: 'occurredAt', header: 'Date & time', sortable: true },
  ];

  protected readonly rowId = (row: Referral): string => row.id;

  constructor() {
    connectListToUrl(referralsList, { filterKeys: REFERRAL_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.fromDate, f.fromDate ?? '');
      this.sync(this.toDate, f.toDate ?? '');
      this.sync(this.categoryFilter, f.partnerCategory ?? '');
      this.sync(this.organisationFilter, f.organisationId ?? '');
      this.sync(this.eventFilter, f.eventCode ?? '');
      this.sync(this.commissionFilter, f.commissionStatus ?? '');
    });

    for (const control of [
      this.fromDate,
      this.toDate,
      this.categoryFilter,
      this.organisationFilter,
      this.eventFilter,
      this.commissionFilter,
    ]) {
      control.valueChanges.subscribe(() => this.push());
    }
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }

  private push(): void {
    this.facade.setFilters({
      fromDate: this.fromDate.value || undefined,
      toDate: this.toDate.value || undefined,
      partnerCategory: (this.categoryFilter.value || undefined) as Referral['partnerCategory'] | undefined,
      organisationId: this.organisationFilter.value || undefined,
      eventCode: this.eventFilter.value || undefined,
      commissionStatus: (this.commissionFilter.value || undefined) as ReferralCommissionStatus | undefined,
    });
  }

  protected sourceLabel(r: Referral): string {
    return r.partnerCategory === 'ORGANISATION'
      ? (r.organisationName ?? '—')
      : (r.partnerName ?? '—');
  }

  protected categoryLabel(r: Referral): string {
    return PARTNER_CATEGORY_LABEL[r.partnerCategory];
  }

  protected commissionTone(status: ReferralCommissionStatus): 'success' | 'warning' | 'danger' | 'neutral' {
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

  protected openDetail(row: Referral): void {
    this.dialog.open(ReferralDetailDialogComponent, {
      data: { referral: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }
}
