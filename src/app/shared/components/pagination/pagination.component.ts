import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface PageChange {
  readonly page: number;
  readonly size: number;
}

/**
 * Server-pagination control: "x–y of N", page size selector, prev/next. Emits the
 * desired page/size; the parent owns the query and re-fetches.
 */
@Component({
  selector: 'app-pagination',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  /** Zero-based current page. */
  readonly page = input.required<number>();
  readonly size = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 50, 100]);
  readonly disabled = input(false);

  readonly pageChange = output<PageChange>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / Math.max(1, this.size()))),
  );
  protected readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : this.page() * this.size() + 1,
  );
  protected readonly rangeEnd = computed(() =>
    Math.min(this.totalItems(), (this.page() + 1) * this.size()),
  );
  protected readonly canPrev = computed(() => this.page() > 0 && !this.disabled());
  protected readonly canNext = computed(() => this.page() + 1 < this.totalPages() && !this.disabled());

  protected prev(): void {
    if (this.canPrev()) this.pageChange.emit({ page: this.page() - 1, size: this.size() });
  }

  protected next(): void {
    if (this.canNext()) this.pageChange.emit({ page: this.page() + 1, size: this.size() });
  }

  protected onSizeChange(value: string): void {
    const size = Number(value);
    if (Number.isFinite(size) && size > 0) {
      this.pageChange.emit({ page: 0, size });
    }
  }
}
