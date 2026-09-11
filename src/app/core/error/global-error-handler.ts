import { ErrorHandler, Injectable, NgZone, inject, isDevMode } from '@angular/core';
import { isApiError } from '../models/api-error.util';
import { NotificationService } from '../notifications/notification.service';

/**
 * Catches anything that escapes an effect/subscription. Normalised {@link ApiError}s
 * become a toast; everything else is logged and shown as a generic message so raw
 * technical errors never reach end users.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationService);
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    const unwrapped =
      error && typeof error === 'object' && 'rejection' in error
        ? (error as { rejection: unknown }).rejection
        : error;

    if (isApiError(unwrapped)) {
      this.zone.run(() => this.notifications.fromApiError(unwrapped));
      if (isDevMode()) {
        console.error('[ApiError]', unwrapped);
      }
      return;
    }

    console.error(unwrapped);
    this.zone.run(() =>
      this.notifications.error('Something went wrong', {
        detail: 'The action could not be completed. Please try again.',
      }),
    );
  }
}
