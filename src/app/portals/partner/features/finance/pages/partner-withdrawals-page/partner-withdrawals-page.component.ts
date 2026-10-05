import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, defer, of } from 'rxjs';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import {
  PARTNER_WITHDRAWAL_STATUS_LABEL,
  PartnerWithdrawal,
  PartnerWithdrawalStatus,
} from '../../models/finance.model';

@Component({
  selector: 'app-partner-withdrawals-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-withdrawals-page.component.html',
  styleUrl: './partner-withdrawals-page.component.css',
})
export class PartnerWithdrawalsPageComponent {
  private readonly api = inject(PartnerFinanceApi);
  private readonly notifications = inject(NotificationService);

  protected readonly refreshTick = signal(0);

  protected readonly data = toSignal(
    defer(() => this.api.listWithdrawals(0, 50)).pipe(
      catchError(() => of({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 })),
    ),
    { initialValue: null },
  );

  protected readonly label = PARTNER_WITHDRAWAL_STATUS_LABEL;

  protected cancelable(w: PartnerWithdrawal): boolean {
    if (w.status !== 'REQUESTED') return false;
    // Only show after 10 seconds — see spec.
    const requested = new Date(w.requestedAt).getTime();
    return Date.now() - requested > 10_000;
  }

  protected cancel(w: PartnerWithdrawal): void {
    this.api.cancelWithdrawal(w.id).subscribe({
      next: () => {
        this.notifications.success('Withdrawal cancelled.');
        this.refreshTick.update((v) => v + 1);
      },
      error: (err) => {
        this.notifications.error(err?.message ?? 'Could not cancel.');
      },
    });
  }

  protected tone(status: PartnerWithdrawalStatus): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'REQUESTED':
      case 'PROCESSING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
