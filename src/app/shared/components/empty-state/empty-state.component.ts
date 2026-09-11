import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Empty / no-results / error placeholder for list and detail views. */
@Component({
  selector: 'app-empty-state',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  readonly title = input('Nothing here yet');
  readonly message = input('');
  readonly tone = input<'default' | 'error'>('default');
}
