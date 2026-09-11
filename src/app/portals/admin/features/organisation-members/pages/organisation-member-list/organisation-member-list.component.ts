import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SortSpec } from '@core/models/api.model';
import { ENTITY_STATUS_LABEL } from '@core/models/common.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { OrganisationOptionsService } from '../../data-access/organisation-options.service';
import { OrganisationMemberFormDialogComponent } from '../../components/organisation-member-form-dialog/organisation-member-form-dialog.component';
import { OrganisationMember } from '../../models/organisation-member.model';
import { OrganisationMembersFacade } from '../../store/organisation-members.facade';
import {
  ORGANISATION_MEMBER_FILTER_KEYS,
  organisationMembersList,
} from '../../store/organisation-members.list';

@Component({
  selector: 'app-organisation-member-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-member-list.component.html',
  styleUrl: './organisation-member-list.component.css',
})
export class OrganisationMemberListComponent {
  protected readonly facade = inject(OrganisationMembersFacade);
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(ConfirmService);

  protected readonly orgOptions = toSignal(inject(OrganisationOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly orgFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  protected readonly columns: TableColumn<OrganisationMember>[] = [
    { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
    {
      key: 'organisationName',
      header: 'Organisation',
      sortable: true,
      primary: true,
      value: (r) => r.organisationName,
    },
    { key: 'organisationReferralCode', header: 'Org code', value: (r) => r.organisationReferralCode },
    { key: 'specialisation', header: 'Specialisation', value: (r) => r.specialisation ?? '' },
    { key: 'mobile', header: 'Mobile', hideOnMobile: true, value: (r) => r.mobile },
    { key: 'email', header: 'Email', hideOnMobile: true, value: (r) => r.email },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  protected readonly rowId = (row: OrganisationMember): string => row.id;

  constructor() {
    connectListToUrl(organisationMembersList, { filterKeys: ORGANISATION_MEMBER_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.orgFilter, f.organisationId ?? '');
      this.sync(this.statusFilter, f.status ?? '');
    });

    this.orgFilter.valueChanges.subscribe(() => this.push());
    this.statusFilter.valueChanges.subscribe(() => this.push());
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }

  private push(): void {
    this.facade.setFilters({
      organisationId: this.orgFilter.value || undefined,
      status: (this.statusFilter.value || undefined) as OrganisationMember['status'] | undefined,
    });
  }

  protected statusTone(status: OrganisationMember['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }
  protected statusLabel(status: OrganisationMember['status']): string {
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

  protected addMember(): void {
    this.dialog.open(OrganisationMemberFormDialogComponent, {
      data: { mode: 'create', organisationId: this.orgFilter.value || undefined },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected editMember(row: OrganisationMember): void {
    this.dialog.open(OrganisationMemberFormDialogComponent, {
      data: { mode: 'edit', member: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected async toggleStatus(row: OrganisationMember): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate ${row.name}?` : `Reactivate ${row.name}?`,
      message: deactivating
        ? 'They can no longer be chosen as "Referred By" for new attributions. Existing attributions and commissions are retained.'
        : 'They can be chosen as a referring doctor again.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
  }
}
