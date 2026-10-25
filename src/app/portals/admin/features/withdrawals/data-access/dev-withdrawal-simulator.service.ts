import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id } from '@core/models/api.model';

export interface SimulateWebhookResult {
  readonly handled: boolean;
  readonly idempotent: boolean;
  readonly withdrawal: {
    readonly id: string;
    readonly reference: string;
    readonly status: string;
    readonly paidAt?: string;
    readonly failedAt?: string;
    readonly failureReason?: string;
    readonly paymentReference?: string;
  } | null;
}

/**
 * Non-production helper that calls the dev endpoint on the backend to
 * simulate a RazorpayX payout webhook. Keeps testers from needing to
 * compute HMAC signatures / expose localhost via a tunnel. The backend
 * refuses to answer when ENVIRONMENT=production.
 */
@Injectable({ providedIn: 'root' })
export class DevWithdrawalSimulatorService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly base = `${this.config.apiBaseUrl}/adm/dev/withdrawals`;

  /** True only in non-production builds — gate buttons on this. */
  readonly isAvailable = !this.config.production;

  simulate(
    id: Id,
    state: 'PAID' | 'FAILED',
    extras: { utr?: string; reason?: string } = {},
  ): Observable<SimulateWebhookResult> {
    return this.http
      .post<any>(`${this.base}/${id}/simulate-webhook`, { state, ...extras })
      .pipe(map((res) => res.data as SimulateWebhookResult));
  }
}
