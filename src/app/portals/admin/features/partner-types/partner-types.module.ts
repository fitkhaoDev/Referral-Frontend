import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { PartnerTypeFormDialogComponent } from './components/partner-type-form-dialog/partner-type-form-dialog.component';
import { partnerTypeApiProvider } from './data-access/partner-type-api.provider';
import { PartnerTypeListComponent } from './pages/partner-type-list/partner-type-list.component';
import { PartnerTypesRoutingModule } from './partner-types-routing.module';
import { PartnerTypesEffects } from './store/partner-types.effects';
import {
  PARTNER_TYPES_CRUD_KEY,
  partnerTypesCrudReducer,
} from './store/partner-types.crud.reducer';
import { PartnerTypesFacade } from './store/partner-types.facade';
import { partnerTypesList } from './store/partner-types.list';

/** Admin → Partner Types feature (lazy-loaded). */
@NgModule({
  imports: [
    SharedModule,
    PartnerTypesRoutingModule,
    StoreModule.forFeature(partnerTypesList.name, partnerTypesList.reducer),
    StoreModule.forFeature(PARTNER_TYPES_CRUD_KEY, partnerTypesCrudReducer),
    EffectsModule.forFeature([PartnerTypesEffects]),
  ],
  declarations: [PartnerTypeListComponent, PartnerTypeFormDialogComponent],
  providers: [partnerTypeApiProvider, PartnerTypesFacade],
})
export class PartnerTypesModule {}
