import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { referralEventApiProvider } from '../referral-events/data-access/referral-event-api.provider';
import { ReferralDetailDialogComponent } from './components/referral-detail-dialog/referral-detail-dialog.component';
import { referralApiProvider } from './data-access/referral-api.provider';
import { ReferralsOptionsService } from './data-access/referrals-options.service';
import { ReferralListComponent } from './pages/referral-list/referral-list.component';
import { ReferralsRoutingModule } from './referrals-routing.module';
import { ReferralsEffects } from './store/referrals.effects';
import { ReferralsFacade } from './store/referrals.facade';
import { referralsList } from './store/referrals.list';

/** Admin → Referrals feature (read-only). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    ReferralsRoutingModule,
    StoreModule.forFeature(referralsList.name, referralsList.reducer),
    EffectsModule.forFeature([ReferralsEffects]),
  ],
  declarations: [ReferralListComponent, ReferralDetailDialogComponent],
  providers: [
    referralApiProvider,
    organisationApiProvider,
    referralEventApiProvider,
    ReferralsOptionsService,
    ReferralsFacade,
  ],
})
export class ReferralsModule {}
