import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { StatusTone } from '@shared/components/status-badge/status-badge.component';
import {
  COMMISSION_STATUS_LABEL,
  type Commission,
  type CommissionStatus,
} from '../../../commissions/models/commission.model';
import {
  WITHDRAWAL_BENEFICIARY_TYPE_LABEL,
  type Withdrawal,
  type WithdrawalBeneficiaryType,
} from '../../../withdrawals/models/withdrawal.model';
import { AdminDashboardService } from './admin-dashboard.service';

type BeneficiaryRow = Pick<
  Commission,
  'beneficiaryType' | 'partnerName' | 'organisationName' | 'memberName'
>;

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  private readonly auth = inject(AuthFacadeService);
  private readonly service = inject(AdminDashboardService);

  protected readonly user = this.auth.user('admin');
  protected readonly skeletons = Array.from({ length: 6 });

  protected readonly counts = toSignal(this.service.counts$, { initialValue: null });
  protected readonly latestCommissions = toSignal(this.service.latestCommissions$, {
    initialValue: [] as Commission[],
  });
  protected readonly withdrawalsToAction = toSignal(this.service.withdrawalsToAction$, {
    initialValue: [] as Withdrawal[],
  });

  protected beneficiaryName(row: BeneficiaryRow): string {
    if (row.beneficiaryType === 'DOCTOR') return row.memberName ?? '—';
    if (row.beneficiaryType === 'ORGANISATION') return row.organisationName ?? '—';
    return row.partnerName ?? '—';
  }

  // Label maps are read inside methods, never in field initializers — a cross-feature
  // const-map read in a field initializer resolves `undefined` under some module
  // init orders (see feedback-ngmodule-classic-conventions).
  protected commissionStatusLabelOf(status: CommissionStatus): string {
    return COMMISSION_STATUS_LABEL[status];
  }

  protected beneficiaryTypeLabelOf(type: WithdrawalBeneficiaryType): string {
    return WITHDRAWAL_BENEFICIARY_TYPE_LABEL[type];
  }

  protected commissionTone(status: CommissionStatus): StatusTone {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REVERSED':
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
