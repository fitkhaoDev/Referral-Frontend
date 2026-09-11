import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { commissionApiProvider } from '../commissions/data-access/commission-api.provider';
import { discountRuleApiProvider } from '../discount-rules/data-access/discount-rule-api.provider';
import { incentiveRuleApiProvider } from '../incentive-rules/data-access/incentive-rule-api.provider';
import { organisationMemberApiProvider } from '../organisation-members/data-access/organisation-member-api.provider';
import { organisationTypeApiProvider } from '../organisation-types/data-access/organisation-type-api.provider';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { partnerTypeApiProvider } from '../partner-types/data-access/partner-type-api.provider';
import { partnerApiProvider } from '../partners/data-access/partner-api.provider';
import { referralEventApiProvider } from '../referral-events/data-access/referral-event-api.provider';
import { referralApiProvider } from '../referrals/data-access/referral-api.provider';
import { walletApiProvider } from '../wallets/data-access/wallet-api.provider';
import { withdrawalApiProvider } from '../withdrawals/data-access/withdrawal-api.provider';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminDashboardService } from './pages/admin-dashboard/admin-dashboard.service';

/**
 * Admin → Dashboard. Lazy-loaded. The overview is assembled read-only from the
 * other domains' list endpoints, so this module binds their API providers in its
 * own lazy scope (each feature module still binds its own independently).
 */
@NgModule({
  imports: [SharedModule, DashboardRoutingModule],
  declarations: [AdminDashboardComponent],
  providers: [
    partnerApiProvider,
    organisationApiProvider,
    organisationMemberApiProvider,
    referralApiProvider,
    commissionApiProvider,
    withdrawalApiProvider,
    walletApiProvider,
    partnerTypeApiProvider,
    organisationTypeApiProvider,
    referralEventApiProvider,
    incentiveRuleApiProvider,
    discountRuleApiProvider,
    AdminDashboardService,
  ],
})
export class DashboardModule {}
