import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marks an `<ng-template>` as the cell renderer for a column.
 *
 * ```html
 * <ng-template appColumnCell="status" let-row>
 *   <app-status-badge [label]="row.status" [tone]="tone(row.status)"></app-status-badge>
 * </ng-template>
 * ```
 * The template context exposes the row as `$implicit` and as `row`.
 */
@Directive({
  selector: '[appColumnCell]',
  standalone: false,
})
export class ColumnCellDirective {
  /** Column `key` this template renders. */
  readonly key = input.required<string>({ alias: 'appColumnCell' });
  readonly template = inject(TemplateRef<{ $implicit: unknown; row: unknown }>);
}
