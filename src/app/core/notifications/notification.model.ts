export type NotificationTone = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  readonly id: string;
  readonly tone: NotificationTone;
  readonly title: string;
  readonly detail?: string;
  /** Auto-dismiss delay in ms; 0 keeps it until dismissed. */
  readonly durationMs: number;
  /** Optional single action (e.g. "Retry"). */
  readonly action?: { readonly label: string; readonly handler: () => void };
}

export interface NotificationOptions {
  readonly detail?: string;
  readonly durationMs?: number;
  readonly action?: { readonly label: string; readonly handler: () => void };
}
