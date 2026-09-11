import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

/**
 * List toolbar: debounced search + a slot for filter controls + a clear-all action.
 *
 * On desktop the projected filters sit inline; below 768px they collapse into a
 * bottom sheet toggled by a "Filters" button (with an active-filter count badge).
 * The same projected content is used for both — no re-projection.
 *
 * Search is debounced here (300ms + distinct) before `searchChange` fires, so the
 * list effect can safely `switchMap`.
 */
@Component({
  selector: 'app-filter-bar',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.css',
})
export class FilterBarComponent {
  /** Current committed search term (e.g. from the store / URL). */
  readonly searchTerm = input('');
  readonly searchPlaceholder = input('Search…');
  /** Number of active filters (incl. search) — drives the mobile badge + clear-all visibility. */
  readonly activeCount = input(0);
  readonly hasFilters = input(true);

  readonly searchChange = output<string>();
  readonly clearAll = output<void>();

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly sheetOpen = signal(false);

  private readonly debouncedSearch = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      map((v) => v.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: null },
  );

  constructor() {
    // Reflect external term changes into the input without echoing back an event.
    effect(() => {
      const term = this.searchTerm();
      if (term !== this.searchControl.value) {
        this.searchControl.setValue(term, { emitEvent: false });
      }
    });

    effect(() => {
      const value = this.debouncedSearch();
      if (value !== null && value !== this.searchTerm()) {
        this.searchChange.emit(value);
      }
    });
  }

  protected toggleSheet(): void {
    this.sheetOpen.update((v) => !v);
  }

  protected closeSheet(): void {
    this.sheetOpen.set(false);
  }

  protected onClearAll(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.clearAll.emit();
    this.closeSheet();
  }
}
