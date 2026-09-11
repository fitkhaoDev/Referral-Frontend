import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortSpec } from '@core/models/api.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { PartnerTypeOptionsService } from '../../data-access/partner-type-options.service';
import { Partner, PARTNER_STATUS_LABEL } from '../../models/partner.model';
import { PartnersFacade } from '../../store/partners.facade';
import { PARTNER_FILTER_KEYS, partnersList } from '../../store/partners.list';

@Component({
  selector: 'app-partner-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-list.component.html',
  styleUrl: './partner-list.component.css',
})
export class PartnerListComponent {
  protected readonly facade = inject(PartnersFacade);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);

  protected readonly typeOptions = toSignal(inject(PartnerTypeOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly typeFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly passwordFilter = new FormControl<string>('', { nonNullable: true });

  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];
  protected readonly passwordOptions: SelectOption[] = [
    { value: 'MUST_CHANGE', label: 'Must change password' },
    { value: 'OK', label: 'Password set' },
  ];

  protected readonly columns: TableColumn<Partner>[] = [
    { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
    { key: 'partnerId', header: 'Partner ID', sortable: true, primary: true, value: (r) => r.partnerId },
    { key: 'partnerTypeName', header: 'Type', sortable: true, value: (r) => r.partnerTypeName },
    { key: 'referralCode', header: 'Referral code', value: (r) => r.referralCode },
    { key: 'mobile', header: 'Mobile', hideOnMobile: true, value: (r) => r.mobile },
    { key: 'email', header: 'Email', hideOnMobile: true, value: (r) => r.email },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  protected readonly rowId = (row: Partner): string => row.id;

  constructor() {
    connectListToUrl(partnersList, { filterKeys: PARTNER_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.syncControl(this.statusFilter, f.status ?? '');
      this.syncControl(this.typeFilter, f.partnerTypeId ?? '');
      this.syncControl(this.passwordFilter, f.passwordState ?? '');
    });

    this.statusFilter.valueChanges.subscribe(() => this.pushFilters());
    this.typeFilter.valueChanges.subscribe(() => this.pushFilters());
    this.passwordFilter.valueChanges.subscribe(() => this.pushFilters());
  }

  private syncControl(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }

  private pushFilters(): void {
    this.facade.setFilters({
      status: (this.statusFilter.value || undefined) as Partner['status'] | undefined,
      partnerTypeId: this.typeFilter.value || undefined,
      passwordState: (this.passwordFilter.value || undefined) as Partner['passwordState'] | undefined,
    });
  }

  protected statusTone(status: Partner['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }

  protected statusLabel(status: Partner['status']): string {
    return PARTNER_STATUS_LABEL[status];
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

  protected enrol(): void {
    void this.router.navigate(['/admin/partners/new']);
  }

  protected view(row: Partner): void {
    void this.router.navigate(['/admin/partners', row.id]);
  }

  protected async toggleStatus(row: Partner): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate ${row.name}?` : `Reactivate ${row.name}?`,
      message: deactivating
        ? 'They will not be able to sign in. Referrals, commissions, wallet and withdrawal history are all retained.'
        : 'They will be able to sign in to the partner portal again.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) {
      this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
    }
  }
}
