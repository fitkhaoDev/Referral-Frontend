import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SortSpec } from '@core/models/api.model';
import { ENTITY_STATUS_LABEL } from '@core/models/common.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { OrganisationTypeFormDialogComponent } from '../../components/organisation-type-form-dialog/organisation-type-form-dialog.component';
import { OrganisationType } from '../../models/organisation-type.model';
import { OrganisationTypesFacade } from '../../store/organisation-types.facade';
import {
  ORGANISATION_TYPE_FILTER_KEYS,
  organisationTypesList,
} from '../../store/organisation-types.list';

@Component({
  selector: 'app-organisation-type-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-type-list.component.html',
  styleUrl: './organisation-type-list.component.css',
})
export class OrganisationTypeListComponent {
  protected readonly facade = inject(OrganisationTypesFacade);
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(ConfirmService);

  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  protected readonly columns: TableColumn<OrganisationType>[] = [
    { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
    { key: 'code', header: 'Code', sortable: true, primary: true, value: (r) => r.code },
    { key: 'description', header: 'Description', hideOnMobile: true, value: (r) => r.description ?? '' },
    {
      key: 'organisationCount',
      header: 'Organisations',
      sortable: true,
      align: 'end',
      value: (r) => r.organisationCount,
    },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  protected readonly rowId = (row: OrganisationType): string => row.id;

  constructor() {
    connectListToUrl(organisationTypesList, { filterKeys: ORGANISATION_TYPE_FILTER_KEYS });

    effect(() => {
      const current = this.facade.filters().status ?? '';
      if (current !== this.statusFilter.value) {
        this.statusFilter.setValue(current, { emitEvent: false });
      }
    });

    this.statusFilter.valueChanges.subscribe((value) =>
      this.facade.setFilters({
        status: (value || undefined) as OrganisationType['status'] | undefined,
      }),
    );
  }

  protected statusTone(status: OrganisationType['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }

  protected statusLabel(status: OrganisationType['status']): string {
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

  protected openCreate(): void {
    this.dialog.open(OrganisationTypeFormDialogComponent, {
      data: { mode: 'create' },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected openEdit(row: OrganisationType): void {
    this.dialog.open(OrganisationTypeFormDialogComponent, {
      data: { mode: 'edit', organisationType: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected async toggleStatus(row: OrganisationType): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate “${row.name}”?` : `Reactivate “${row.name}”?`,
      message: deactivating
        ? 'Existing organisations keep this type. It just won’t be selectable for new organisations.'
        : 'This organisation type will be selectable again.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) {
      this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
    }
  }
}
