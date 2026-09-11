import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Standard screen header: title, optional count/subtitle, and an `[actions]` slot for
 * buttons.
 */
@Component({
  selector: 'app-page-header',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly count = input<number | null>(null);
}
