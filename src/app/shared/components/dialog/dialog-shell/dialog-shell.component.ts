import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input, output } from '@angular/core';

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
  /** Removes the 560px width cap — the dialog fills the panel width set by the caller. */
  readonly wide = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();

  protected close(): void {
    this.dismissed.emit();
    this.dialogRef?.close();
  }
}
