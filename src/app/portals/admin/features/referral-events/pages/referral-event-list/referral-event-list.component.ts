import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SortSpec } from '@core/models/api.model';
import { ENTITY_STATUS_LABEL } from '@core/models/common.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { ReferralEventFormDialogComponent } from '../../components/referral-event-form-dialog/referral-event-form-dialog.component';
import { ReferralEvent } from '../../models/referral-event.model';
import { ReferralEventsFacade } from '../../store/referral-events.facade';
import {
  REFERRAL_EVENT_FILTER_KEYS,
  referralEventsList,
} from '../../store/referral-events.list';

@Component({
  selector: 'app-referral-event-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './referral-event-list.component.html',
  styleUrl: './referral-event-list.component.css',
})
export class ReferralEventListComponent {
  protected readonly facade = inject(ReferralEventsFacade);
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(ConfirmService);

  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly systemFilter = new FormControl<string>('', { nonNullable: true });

  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];
  protected readonly systemOptions: SelectOption[] = [
    { value: 'true', label: 'System' },
    { value: 'false', label: 'Custom' },
  ];

  protected readonly columns: TableColumn<ReferralEvent>[] = [
    { key: 'sortOrder', header: 'Order', sortable: true, align: 'end', value: (r) => r.sortOrder },
    { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
    { key: 'code', header: 'Code', sortable: true, primary: true, value: (r) => r.code },
    { key: 'description', header: 'Description', hideOnMobile: true, value: (r) => r.description ?? '' },
    { key: 'system', header: 'Kind' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', align: 'end' },
  ];

  protected readonly rowId = (row: ReferralEvent): string => row.id;

  constructor() {
    connectListToUrl(referralEventsList, { filterKeys: REFERRAL_EVENT_FILTER_KEYS });

    effect(() => {
      const s = this.facade.filters().status ?? '';
      if (s !== this.statusFilter.value) this.statusFilter.setValue(s, { emitEvent: false });
      const sys = this.facade.filters().system ?? '';
      if (sys !== this.systemFilter.value) this.systemFilter.setValue(sys, { emitEvent: false });
    });

    this.statusFilter.valueChanges.subscribe((value) =>
      this.facade.setFilters({
        status: (value || undefined) as ReferralEvent['status'] | undefined,
        system: (this.systemFilter.value || undefined) as 'true' | 'false' | undefined,
      }),
    );
    this.systemFilter.valueChanges.subscribe((value) =>
      this.facade.setFilters({
        status: (this.statusFilter.value || undefined) as ReferralEvent['status'] | undefined,
        system: (value || undefined) as 'true' | 'false' | undefined,
      }),
    );
  }

  protected statusTone(status: ReferralEvent['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }

  protected statusLabel(status: ReferralEvent['status']): string {
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
    this.dialog.open(ReferralEventFormDialogComponent, {
      data: { mode: 'create' },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected openEdit(row: ReferralEvent): void {
    this.dialog.open(ReferralEventFormDialogComponent, {
      data: { mode: 'edit', event: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected async toggleStatus(row: ReferralEvent): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate “${row.name}”?` : `Reactivate “${row.name}”?`,
      message: deactivating
        ? 'Historical commissions that reference this event are unaffected. Incentive rules won’t be able to target it for new events.'
        : 'Incentive rules can target this event again.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) {
      this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
    }
  }
}
