import { Injectable, signal } from '@angular/core';
import { ApiError } from '../models/api.model';
import { Notification, NotificationOptions, NotificationTone } from './notification.model';

const DEFAULT_DURATION: Record<NotificationTone, number> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 0, // errors stay until dismissed
};

/**
 * App-wide, accessible toast notifications. The host container (rendered once in each
 * portal shell) is an `aria-live` region; errors also expose a dismiss control.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly items = signal<readonly Notification[]>([]);
  readonly notifications = this.items.asReadonly();

  success(title: string, opts?: NotificationOptions): string {
    return this.push('success', title, opts);
  }

  info(title: string, opts?: NotificationOptions): string {
    return this.push('info', title, opts);
  }

  warning(title: string, opts?: NotificationOptions): string {
    return this.push('warning', title, opts);
  }

  error(title: string, opts?: NotificationOptions): string {
    return this.push('error', title, opts);
  }

  /**
   * Surface a normalised API error. Field-validation (422 / 400 with fieldErrors) is
   * handled inline by forms, so it returns `null` and shows nothing.
   */
  fromApiError(error: ApiError, fallbackTitle = 'Something went wrong'): string | null {
    if (error.status === 422 || (error.status === 400 && !!error.fieldErrors)) {
      return null;
    }
    return this.push('error', error.message || fallbackTitle, {
      detail: error.correlationId ? `Reference: ${error.correlationId}` : undefined,
    });
  }

  dismiss(id: string): void {
    this.items.update((list) => list.filter((n) => n.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }

  private push(tone: NotificationTone, title: string, opts?: NotificationOptions): string {
    const id = `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const durationMs = opts?.durationMs ?? DEFAULT_DURATION[tone];
    const notification: Notification = {
      id,
      tone,
      title,
      detail: opts?.detail,
      durationMs,
      action: opts?.action,
    };
    this.items.update((list) => [...list, notification]);
    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }
}
