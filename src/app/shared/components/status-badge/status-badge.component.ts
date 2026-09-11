import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Small labelled status pill. Meaning is conveyed by colour AND a leading dot AND
 * the text label, so it never depends on colour alone.
 */
@Component({
  selector: 'app-status-badge',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');
}
