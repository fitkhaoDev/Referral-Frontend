import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AlertTone = 'error' | 'warning' | 'success' | 'info';

/** Inline, non-toast message block (form errors, contextual notices). */
@Component({
  selector: 'app-alert',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  readonly tone = input<AlertTone>('info');
  readonly title = input('');
  protected readonly glyph = computed(
    () => ({ error: '!', warning: '△', success: '✓', info: 'i' })[this.tone()],
  );
}
