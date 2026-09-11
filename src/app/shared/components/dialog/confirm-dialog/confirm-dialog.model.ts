export interface ConfirmDialogData {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /** `danger` styles the confirm button red (deactivate, reset, etc.). */
  readonly tone?: 'primary' | 'danger';
}
