import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { ReferralEventFormDialogComponent } from './components/referral-event-form-dialog/referral-event-form-dialog.component';
import { referralEventApiProvider } from './data-access/referral-event-api.provider';
import { ReferralEventListComponent } from './pages/referral-event-list/referral-event-list.component';
import { ReferralEventsRoutingModule } from './referral-events-routing.module';
import {
  REFERRAL_EVENTS_CRUD_KEY,
  referralEventsCrudReducer,
} from './store/referral-events.crud.reducer';
import { ReferralEventsEffects } from './store/referral-events.effects';
import { ReferralEventsFacade } from './store/referral-events.facade';
import { referralEventsList } from './store/referral-events.list';

/** Admin → Referral Events feature (lazy-loaded). */
@NgModule({
  imports: [
    SharedModule,
    ReferralEventsRoutingModule,
    StoreModule.forFeature(referralEventsList.name, referralEventsList.reducer),
    StoreModule.forFeature(REFERRAL_EVENTS_CRUD_KEY, referralEventsCrudReducer),
    EffectsModule.forFeature([ReferralEventsEffects]),
  ],
  declarations: [ReferralEventListComponent, ReferralEventFormDialogComponent],
  providers: [referralEventApiProvider, ReferralEventsFacade],
})
export class ReferralEventsModule {}
