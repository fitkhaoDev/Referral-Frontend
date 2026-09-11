import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SortSpec } from '@core/models/api.model';
import { ENTITY_STATUS_LABEL } from '@core/models/common.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { PartnerTypeFormDialogComponent } from '../../components/partner-type-form-dialog/partner-type-form-dialog.component';
import { PartnerType } from '../../models/partner-type.model';
import { PartnerTypesFacade } from '../../store/partner-types.facade';
import { PARTNER_TYPE_FILTER_KEYS, partnerTypesList } from '../../store/partner-types.list';

@Component({
  selector: 'app-partner-type-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-type-list.component.html',
  styleUrl: './partner-type-list.component.css',
})
export class PartnerTypeListComponent {
  protected readonly facade = inject(PartnerTypesFacade);
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(ConfirmService);

  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });

  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  protected readonly columns: TableColumn<PartnerType>[] = [
    { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
    { key: 'code', header: 'Code', sortable: true, primary: true, value: (r) => r.code },
    {
      key: 'description',
      header: 'Description',
      hideOnMobile: true,
      value: (r) => r.description ?? '',
    },
    {
      key: 'partnerCount',
      header: 'Partners',
      sortable: true,
      align: 'end',
      value: (r) => r.partnerCount,
    },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  protected readonly rowId = (row: PartnerType): string => row.id;

  constructor() {
    connectListToUrl(partnerTypesList, { filterKeys: PARTNER_TYPE_FILTER_KEYS });

    effect(() => {
      const current = this.facade.filters().status ?? '';
      if (current !== this.statusFilter.value) {
        this.statusFilter.setValue(current, { emitEvent: false });
      }
    });

    this.statusFilter.valueChanges.subscribe((value) =>
      this.facade.setFilters({ status: (value || undefined) as PartnerType['status'] | undefined }),
    );
  }

  protected statusTone(status: PartnerType['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }

  protected statusLabel(status: PartnerType['status']): string {
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
    this.dialog.open(PartnerTypeFormDialogComponent, {
      data: { mode: 'create' },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected openEdit(row: PartnerType): void {
    this.dialog.open(PartnerTypeFormDialogComponent, {
      data: { mode: 'edit', partnerType: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected async toggleStatus(row: PartnerType): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate “${row.name}”?` : `Reactivate “${row.name}”?`,
      message: deactivating
        ? 'Existing partners keep this type. It just won’t be selectable for new partners.'
        : 'This partner type will be selectable again when enrolling partners.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) {
      this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
    }
  }
}
