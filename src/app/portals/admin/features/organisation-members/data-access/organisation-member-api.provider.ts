import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpOrganisationMemberApiService } from './http-organisation-member-api.service';
import { MockOrganisationMemberApiService } from './mock-organisation-member-api.service';
import { OrganisationMemberApi } from './organisation-member-api.abstract';

/** Binds {@link OrganisationMemberApi} to the mock or HTTP implementation. */
export const organisationMemberApiProvider: Provider = {
  provide: OrganisationMemberApi,
  useClass: environment.useMockApi
    ? MockOrganisationMemberApiService
    : HttpOrganisationMemberApiService,
};
