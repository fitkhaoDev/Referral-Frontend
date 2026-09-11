import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SortSpec } from '@core/models/api.model';
import { ColumnCellDirective } from './column-cell.directive';
import { TableColumn } from './table-column.model';

/**
 * Presentational, server-driven data table.
 *
 * - Desktop: a real `<table>` with sortable headers (`aria-sort`) and horizontal
 *   scroll contained to the table.
 * - Compact (< 768px): a stacked card list — `primary` columns form each card's
 *   header, the rest become a labelled list. Financial values stay fully visible.
 *
 * Sorting is single-column and emitted upward (`sortChange`); the parent owns the
 * query and re-fetches. No client-side sorting / paging / filtering happens here.
 */
@Component({
  selector: 'app-data-table',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent<T> {
  private readonly bp = inject(BreakpointObserver);

  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly rowId = input.required<(row: T) => string>();
  readonly sort = input<readonly SortSpec[]>([]);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly clickableRows = input(false, { transform: booleanAttribute });
  readonly pageSize = input(10);
  readonly caption = input('');
  readonly emptyTitle = input('No results');
  readonly emptyMessage = input('Try adjusting your search or filters.');

  readonly sortChange = output<SortSpec[]>();
  readonly rowActivate = output<T>();

  private readonly cellDefs = contentChildren(ColumnCellDirective);
  protected readonly cellTemplates = computed(
    () =>
      new Map<string, TemplateRef<{ $implicit: T; row: T }>>(
        this.cellDefs().map((d) => [d.key(), d.template as TemplateRef<{ $implicit: T; row: T }>]),
      ),
  );

  protected readonly isCompact = toSignal(
    this.bp.observe('(max-width: 767px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  protected readonly activeSort = computed<SortSpec | null>(() => this.sort()[0] ?? null);
  protected readonly primaryCols = computed(() => this.columns().filter((c) => c.primary));
  protected readonly cardDetailCols = computed(() => this.columns().filter((c) => !c.primary));
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(3, Math.min(this.pageSize(), 8)) }),
  );
  protected readonly showEmpty = computed(() => !this.loading() && this.rows().length === 0);

  protected ariaSort(col: TableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!col.sortable) return null;
    const field = col.sortField ?? col.key;
    const active = this.activeSort();
    if (!active || active.field !== field) return 'none';
    return active.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected onHeaderClick(col: TableColumn<T>): void {
    if (!col.sortable) return;
    const field = col.sortField ?? col.key;
    const active = this.activeSort();
    let next: SortSpec | null;
    if (!active || active.field !== field) next = { field, direction: 'asc' };
    else if (active.direction === 'asc') next = { field, direction: 'desc' };
    else next = null;
    this.sortChange.emit(next ? [next] : []);
  }

  protected cellText(col: TableColumn<T>, row: T): string {
    const raw = col.value?.(row);
    return raw === null || raw === undefined || raw === '' ? '—' : String(raw);
  }

  protected trackRow = (_: number, row: T): string => this.rowId()(row);

  protected onRowActivate(row: T): void {
    if (this.clickableRows()) this.rowActivate.emit(row);
  }

  protected onRowKey(event: KeyboardEvent, row: T): void {
    if (!this.clickableRows()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowActivate.emit(row);
    }
  }
}
