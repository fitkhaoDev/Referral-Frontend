import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortSpec } from '@core/models/api.model';
import { ENTITY_STATUS_LABEL } from '@core/models/common.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { OrganisationTypeOptionsService } from '../../data-access/organisation-type-options.service';
import { Organisation } from '../../models/organisation.model';
import { OrganisationsFacade } from '../../store/organisations.facade';
import { ORGANISATION_FILTER_KEYS, organisationsList } from '../../store/organisations.list';

@Component({
  selector: 'app-organisation-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-list.component.html',
  styleUrl: './organisation-list.component.css',
})
export class OrganisationListComponent {
  protected readonly facade = inject(OrganisationsFacade);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);

  protected readonly typeOptions = toSignal(inject(OrganisationTypeOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly typeFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  protected readonly columns: TableColumn<Organisation>[] = [
    { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
    { key: 'referralCode', header: 'Referral code', sortable: false, primary: true, value: (r) => r.referralCode },
    { key: 'organisationTypeName', header: 'Type', sortable: true, value: (r) => r.organisationTypeName },
    { key: 'contactPerson', header: 'Contact', hideOnMobile: true, value: (r) => r.contactPerson },
    { key: 'memberCount', header: 'Members', sortable: true, align: 'end', value: (r) => r.memberCount },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  protected readonly rowId = (row: Organisation): string => row.id;

  constructor() {
    connectListToUrl(organisationsList, { filterKeys: ORGANISATION_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.statusFilter, f.status ?? '');
      this.sync(this.typeFilter, f.organisationTypeId ?? '');
    });

    this.statusFilter.valueChanges.subscribe(() => this.push());
    this.typeFilter.valueChanges.subscribe(() => this.push());
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }
  private push(): void {
    this.facade.setFilters({
      status: (this.statusFilter.value || undefined) as Organisation['status'] | undefined,
      organisationTypeId: this.typeFilter.value || undefined,
    });
  }

  protected statusTone(status: Organisation['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }
  protected statusLabel(status: Organisation['status']): string {
    return ENTITY_STATUS_LABEL[status];
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
    void this.router.navigate(['/admin/organisations/new']);
  }
  protected view(row: Organisation): void {
    void this.router.navigate(['/admin/organisations', row.id]);
  }

  protected async toggleStatus(row: Organisation): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate ${row.name}?` : `Reactivate ${row.name}?`,
      message: deactivating
        ? 'The organisation cannot sign in and its referral code cannot be used for new attributions. All history is retained.'
        : 'The organisation can sign in again and its referral code becomes usable.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
  }
}
