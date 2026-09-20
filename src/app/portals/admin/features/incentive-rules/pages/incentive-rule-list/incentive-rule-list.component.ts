import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { SortSpec } from '@core/models/api.model';
import { ENTITY_STATUS_LABEL } from '@core/models/common.model';
import { toMajorUnits } from '@core/models/money.model';
import { RULE_SCOPE_TYPE_LABEL, RuleScopeType } from '@core/models/rule-scope.model';
import { TableColumn } from '@shared/components/data-table/table-column.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { connectListToUrl } from '@shared/store/connect-list-to-url';
import { RuleScopeOptionsService } from '../../../../shared/rule-scope-options.service';
import { IncentiveRuleFormDialogComponent } from '../../components/incentive-rule-form-dialog/incentive-rule-form-dialog.component';
import {
  INCENTIVE_BENEFICIARY_LABEL,
  IncentiveBeneficiary,
  IncentiveComponent,
  IncentiveRule,
  RenewalIncentive,
} from '../../models/incentive-rule.model';
import { IncentiveRulesFacade } from '../../store/incentive-rules.facade';
import {
  INCENTIVE_RULE_FILTER_KEYS,
  incentiveRulesList,
} from '../../store/incentive-rules.list';

@Component({
  selector: 'app-incentive-rule-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incentive-rule-list.component.html',
  styleUrl: './incentive-rule-list.component.css',
})
export class IncentiveRuleListComponent {
  protected readonly facade = inject(IncentiveRulesFacade);
  private readonly dialog = inject(Dialog);
  private readonly confirm = inject(ConfirmService);
  private readonly locale = inject(LOCALE_ID);
  private readonly scopeOptions$ = inject(RuleScopeOptionsService);

  // Map of scopeId → display label built from all three scope option streams
  private readonly scopeNameMap = toSignal(
    combineLatest([
      this.scopeOptions$.partnerTypeOptions$,
      this.scopeOptions$.organisationTypeOptions$,
      this.scopeOptions$.organisationOptions$,
    ]).pipe(
      map(([pt, ot, org]) => {
        const m = new Map<string, string>();
        for (const o of [...pt, ...ot, ...org]) m.set(o.value as string, o.label);
        return m;
      }),
    ),
    { initialValue: new Map<string, string>() },
  );

  protected readonly scopeFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly beneficiaryFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly statusFilter = new FormControl<string>('', { nonNullable: true });

  protected readonly scopeOptions: SelectOption[] = (
    ['GLOBAL', 'PARTNER_TYPE', 'ORGANISATION_TYPE', 'ORGANISATION'] as RuleScopeType[]
  ).map((v) => ({ value: v, label: RULE_SCOPE_TYPE_LABEL[v] }));
  protected readonly beneficiaryOptions: SelectOption[] = (
    ['PARTNER', 'ORGANISATION', 'DOCTOR'] as IncentiveBeneficiary[]
  ).map((v) => ({ value: v, label: INCENTIVE_BENEFICIARY_LABEL[v] }));
  protected readonly statusOptions: SelectOption[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  protected readonly columns = computed<TableColumn<IncentiveRule>[]>(() => {
    const nameMap = this.scopeNameMap();
    return [
      { key: 'name', header: 'Name', sortable: true, primary: true, value: (r) => r.name },
      {
        key: 'scopeLabel',
        header: 'Applies to',
        primary: true,
        value: (r) => {
          if (r.scopeType === 'GLOBAL') return RULE_SCOPE_TYPE_LABEL['GLOBAL'];
          const label = r.scopeId ? (nameMap.get(r.scopeId) ?? r.scopeLabel) : r.scopeLabel;
          return `${RULE_SCOPE_TYPE_LABEL[r.scopeType]} · ${label}`;
        },
      },
      { key: 'beneficiary', header: 'Who earns', sortable: true },
      { key: 'counselling', header: 'Counselling' },
      { key: 'firstPurchase', header: 'First purchase' },
      { key: 'renewal', header: 'Renewals' },
      { key: 'effectiveFrom', header: 'Effective from', sortable: true, value: (r) => r.effectiveFrom },
      { key: 'version', header: 'Version', align: 'end' },
      { key: 'status', header: 'Status', sortable: true },
      { key: 'actions', header: 'Actions', align: 'end' },
    ];
  });

  protected readonly rowId = (row: IncentiveRule): string => row.id;

  constructor() {
    connectListToUrl(incentiveRulesList, { filterKeys: INCENTIVE_RULE_FILTER_KEYS });

    effect(() => {
      const f = this.facade.filters();
      this.sync(this.scopeFilter, f.scopeType ?? '');
      this.sync(this.beneficiaryFilter, f.beneficiary ?? '');
      this.sync(this.statusFilter, f.status ?? '');
    });

    this.scopeFilter.valueChanges.subscribe(() => this.push());
    this.beneficiaryFilter.valueChanges.subscribe(() => this.push());
    this.statusFilter.valueChanges.subscribe(() => this.push());
  }

  private sync(control: FormControl<string>, value: string): void {
    if (control.value !== value) control.setValue(value, { emitEvent: false });
  }
  private push(): void {
    this.facade.setFilters({
      scopeType: (this.scopeFilter.value || undefined) as RuleScopeType | undefined,
      beneficiary: (this.beneficiaryFilter.value || undefined) as IncentiveBeneficiary | undefined,
      status: (this.statusFilter.value || undefined) as IncentiveRule['status'] | undefined,
    });
  }

  private currency(minorUnits: number, code: string): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(minorUnits / 100);
  }

  protected componentSummary(c: IncentiveComponent): string {
    if (c.kind === 'NONE') return '—';
    if (c.kind === 'FIXED') return c.amount ? this.currency(c.amount.minorUnits, c.amount.currency) : '—';
    return `${c.percent}%`;
  }

  protected renewalSummary(r: RenewalIncentive): string {
    switch (r.kind) {
      case 'NONE':
        return '—';
      case 'PERCENT_INDEFINITE':
        return `${r.percent}% every renewal`;
      case 'FIXED_INDEFINITE':
        return r.amount
          ? `${this.currency(r.amount.minorUnits, r.amount.currency)} every renewal`
          : '—';
      case 'PER_RENEWAL': {
        const tiers = (r.tiers ?? [])
          .map((t) => `#${t.renewalNumber} ${this.componentSummary(t.incentive)}`)
          .join(', ');
        const beyond = r.beyondLastTier ? this.componentSummary(r.beyondLastTier) : '—';
        return `${tiers}, then ${beyond}`;
      }
    }
  }

  protected beneficiaryLabel(b: IncentiveBeneficiary): string {
    return INCENTIVE_BENEFICIARY_LABEL[b];
  }

  protected statusTone(status: IncentiveRule['status']): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
  }
  protected statusLabel(status: IncentiveRule['status']): string {
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
    this.dialog.open(IncentiveRuleFormDialogComponent, {
      data: { mode: 'create' },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }
  protected openEdit(row: IncentiveRule): void {
    this.dialog.open(IncentiveRuleFormDialogComponent, {
      data: { mode: 'edit', rule: row },
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
    });
  }

  protected async toggleStatus(row: IncentiveRule): Promise<void> {
    const deactivating = row.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate "${row.name}"?` : `Reactivate "${row.name}"?`,
      message: deactivating
        ? 'New events in this scope will not generate incentives from this rule. Commissions already generated keep their snapshot and are unaffected.'
        : 'New events in this scope will generate incentives from this rule again.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) this.facade.setStatus(row.id, deactivating ? 'INACTIVE' : 'ACTIVE');
  }
}
