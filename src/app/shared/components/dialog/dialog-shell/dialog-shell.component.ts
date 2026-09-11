import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

/**
 * Standard chrome for CDK dialogs: titled header with a close control, a scrollable
 * body (default slot) and a `[footer]` slot for actions. Closes its `DialogRef` on
 * the X button when opened via the CDK `Dialog` service.
 */
@Component({
  selector: 'app-dialog-shell',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-shell.component.html',
  styleUrl: './dialog-shell.component.css',
})
export class DialogShellComponent {
  private readonly dialogRef = inject(DialogRef, { optional: true });

  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly closeLabel = input('Close dialog');
  readonly dismissed = output<void>();

  protected close(): void {
    this.dismissed.emit();
    this.dialogRef?.close();
  }
}
