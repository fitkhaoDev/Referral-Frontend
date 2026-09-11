import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { organisationTypeApiProvider } from '../organisation-types/data-access/organisation-type-api.provider';
import { organisationMemberApiProvider } from '../organisation-members/data-access/organisation-member-api.provider';
import { OrganisationFormComponent } from './components/organisation-form/organisation-form.component';
import { organisationApiProvider } from './data-access/organisation-api.provider';
import { OrganisationTypeOptionsService } from './data-access/organisation-type-options.service';
import { OrganisationCreateComponent } from './pages/organisation-create/organisation-create.component';
import { OrganisationDetailComponent } from './pages/organisation-detail/organisation-detail.component';
import { OrganisationListComponent } from './pages/organisation-list/organisation-list.component';
import { OrganisationsRoutingModule } from './organisations-routing.module';
import {
  ORGANISATIONS_DETAIL_KEY,
  organisationsDetailReducer,
} from './store/organisations.detail.reducer';
import { OrganisationsEffects } from './store/organisations.effects';
import { OrganisationsFacade } from './store/organisations.facade';
import { organisationsList } from './store/organisations.list';

/** Admin → Organisations feature (organisational partner enrolment). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    OrganisationsRoutingModule,
    StoreModule.forFeature(organisationsList.name, organisationsList.reducer),
    StoreModule.forFeature(ORGANISATIONS_DETAIL_KEY, organisationsDetailReducer),
    EffectsModule.forFeature([OrganisationsEffects]),
  ],
  declarations: [
    OrganisationListComponent,
    OrganisationCreateComponent,
    OrganisationDetailComponent,
    OrganisationFormComponent,
  ],
  providers: [
    organisationApiProvider,
    organisationTypeApiProvider,
    organisationMemberApiProvider,
    OrganisationTypeOptionsService,
    OrganisationsFacade,
  ],
})
export class OrganisationsModule {}
