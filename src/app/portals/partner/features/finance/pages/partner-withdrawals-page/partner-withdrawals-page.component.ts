import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, defer, of } from 'rxjs';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import { WithdrawalRequestStatus } from '../../models/finance.model';

@Component({
  selector: 'app-partner-withdrawals-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-withdrawals-page.component.html',
  styleUrl: './partner-withdrawals-page.component.css',
})
export class PartnerWithdrawalsPageComponent {
  private readonly api = inject(PartnerFinanceApi);

  protected readonly data = toSignal(
    defer(() => this.api.listWithdrawalRequests(0, 50)).pipe(
      catchError(() => of({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 })),
    ),
    { initialValue: null },
  );

  protected readonly statusLabel: Record<WithdrawalRequestStatus, string> = {
    PENDING: 'Pending',
    SUCCESS: 'Success',
    FAILED: 'Failed',
  };

  protected tone(status: WithdrawalRequestStatus): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
    }
  }
}
