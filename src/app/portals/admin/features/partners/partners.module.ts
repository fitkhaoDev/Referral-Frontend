import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { partnerTypeApiProvider } from '../partner-types/data-access/partner-type-api.provider';
import { PartnerFormComponent } from './components/partner-form/partner-form.component';
import { partnerApiProvider } from './data-access/partner-api.provider';
import { PartnerTypeOptionsService } from './data-access/partner-type-options.service';
import { PartnerCreateComponent } from './pages/partner-create/partner-create.component';
import { PartnerDetailComponent } from './pages/partner-detail/partner-detail.component';
import { PartnerListComponent } from './pages/partner-list/partner-list.component';
import { PartnersRoutingModule } from './partners-routing.module';
import { PARTNERS_DETAIL_KEY, partnersDetailReducer } from './store/partners.detail.reducer';
import { PartnersEffects } from './store/partners.effects';
import { PartnersFacade } from './store/partners.facade';
import { partnersList } from './store/partners.list';

/** Admin → Partners feature (individual partner enrolment). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    PartnersRoutingModule,
    StoreModule.forFeature(partnersList.name, partnersList.reducer),
    StoreModule.forFeature(PARTNERS_DETAIL_KEY, partnersDetailReducer),
    EffectsModule.forFeature([PartnersEffects]),
  ],
  declarations: [
    PartnerListComponent,
    PartnerCreateComponent,
    PartnerDetailComponent,
    PartnerFormComponent,
  ],
  providers: [
    partnerApiProvider,
    partnerTypeApiProvider,
    PartnerTypeOptionsService,
    PartnersFacade,
  ],
})
export class PartnersModule {}
