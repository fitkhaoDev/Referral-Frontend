import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerFinanceApi } from '../../features/finance/data-access/partner-finance-api.service';
import { PartnerWalletSummary } from '../../features/finance/models/finance.model';
import { PartnerReferralApi } from '../../features/referrals/data-access/partner-referral-api.service';
import {
  PARTNER_REFERRAL_COMMISSION_STATUS_LABEL,
  PartnerReferralCommissionStatus,
  PartnerReferralPage,
} from '../../features/referrals/models/partner-referral.model';

@Component({
  selector: 'app-partner-dashboard',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.css',
})
export class PartnerDashboardComponent {
  private readonly auth = inject(AuthFacadeService);
  private readonly financeApi = inject(PartnerFinanceApi);
  private readonly referralApi = inject(PartnerReferralApi);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user('partner');
  protected readonly copied = signal(false);

  protected readonly STATUS_LABEL = PARTNER_REFERRAL_COMMISSION_STATUS_LABEL;

  protected readonly wallet = toSignal<PartnerWalletSummary | null>(
    this.financeApi.wallet().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  protected readonly recent = toSignal<PartnerReferralPage | null>(
    this.referralApi.list(0, 5).pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  protected copyCode(): void {
    const code = this.user()?.referralCode;
    if (!code) return;
    void navigator.clipboard
      .writeText(code)
      .then(() => {
        this.copied.set(true);
        this.notifications.success('Referral code copied.');
        setTimeout(() => this.copied.set(false), 1500);
      })
      .catch(() => this.notifications.error('Could not copy. Please copy manually.'));
  }

  protected go(path: string): void {
    void this.router.navigate([path]);
  }

  protected statusTone(status: PartnerReferralCommissionStatus): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REVERSED':
        return 'danger';
      case 'WITHDRAWN':
        return 'info';
      default:
        return 'neutral';
    }
  }
}
