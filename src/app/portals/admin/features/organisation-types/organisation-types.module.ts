import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { OrganisationTypeFormDialogComponent } from './components/organisation-type-form-dialog/organisation-type-form-dialog.component';
import { organisationTypeApiProvider } from './data-access/organisation-type-api.provider';
import { OrganisationTypeListComponent } from './pages/organisation-type-list/organisation-type-list.component';
import { OrganisationTypesRoutingModule } from './organisation-types-routing.module';
import {
  ORGANISATION_TYPES_CRUD_KEY,
  organisationTypesCrudReducer,
} from './store/organisation-types.crud.reducer';
import { OrganisationTypesEffects } from './store/organisation-types.effects';
import { OrganisationTypesFacade } from './store/organisation-types.facade';
import { organisationTypesList } from './store/organisation-types.list';

/** Admin → Organisation Types feature (lazy-loaded). */
@NgModule({
  imports: [
    SharedModule,
    OrganisationTypesRoutingModule,
    StoreModule.forFeature(organisationTypesList.name, organisationTypesList.reducer),
    StoreModule.forFeature(ORGANISATION_TYPES_CRUD_KEY, organisationTypesCrudReducer),
    EffectsModule.forFeature([OrganisationTypesEffects]),
  ],
  declarations: [OrganisationTypeListComponent, OrganisationTypeFormDialogComponent],
  providers: [organisationTypeApiProvider, OrganisationTypesFacade],
})
export class OrganisationTypesModule {}
