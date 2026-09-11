import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { OrganisationMemberFormDialogComponent } from './components/organisation-member-form-dialog/organisation-member-form-dialog.component';
import { organisationMemberApiProvider } from './data-access/organisation-member-api.provider';
import { OrganisationOptionsService } from './data-access/organisation-options.service';
import { OrganisationMemberListComponent } from './pages/organisation-member-list/organisation-member-list.component';
import { OrganisationMembersRoutingModule } from './organisation-members-routing.module';
import {
  ORGANISATION_MEMBERS_CRUD_KEY,
  organisationMembersCrudReducer,
} from './store/organisation-members.crud.reducer';
import { OrganisationMembersEffects } from './store/organisation-members.effects';
import { OrganisationMembersFacade } from './store/organisation-members.facade';
import { organisationMembersList } from './store/organisation-members.list';

/** Admin → Organisation Members feature (lazy-loaded). */
@NgModule({
  imports: [
    SharedModule,
    OrganisationMembersRoutingModule,
    StoreModule.forFeature(organisationMembersList.name, organisationMembersList.reducer),
    StoreModule.forFeature(ORGANISATION_MEMBERS_CRUD_KEY, organisationMembersCrudReducer),
    EffectsModule.forFeature([OrganisationMembersEffects]),
  ],
  declarations: [OrganisationMemberListComponent, OrganisationMemberFormDialogComponent],
  providers: [
    organisationMemberApiProvider,
    organisationApiProvider,
    OrganisationOptionsService,
    OrganisationMembersFacade,
  ],
})
export class OrganisationMembersModule {}
