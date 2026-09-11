import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { referralEventApiProvider } from '../referral-events/data-access/referral-event-api.provider';
import { CommissionDetailDialogComponent } from './components/commission-detail-dialog/commission-detail-dialog.component';
import { commissionApiProvider } from './data-access/commission-api.provider';
import { CommissionsOptionsService } from './data-access/commissions-options.service';
import { CommissionListComponent } from './pages/commission-list/commission-list.component';
import { CommissionsRoutingModule } from './commissions-routing.module';
import { CommissionsEffects } from './store/commissions.effects';
import { CommissionsFacade } from './store/commissions.facade';
import { commissionsList } from './store/commissions.list';

/** Admin → Commissions feature (read-only). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    CommissionsRoutingModule,
    StoreModule.forFeature(commissionsList.name, commissionsList.reducer),
    EffectsModule.forFeature([CommissionsEffects]),
  ],
  declarations: [CommissionListComponent, CommissionDetailDialogComponent],
  providers: [
    commissionApiProvider,
    organisationApiProvider,
    referralEventApiProvider,
    CommissionsOptionsService,
    CommissionsFacade,
  ],
})
export class CommissionsModule {}
