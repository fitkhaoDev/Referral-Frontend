import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpOrganisationTypeApiService } from './http-organisation-type-api.service';
import { MockOrganisationTypeApiService } from './mock-organisation-type-api.service';
import { OrganisationTypeApi } from './organisation-type-api.abstract';

/** Binds {@link OrganisationTypeApi} to the mock or HTTP implementation. Registered in `OrganisationTypesModule`. */
export const organisationTypeApiProvider: Provider = {
  provide: OrganisationTypeApi,
  useClass: environment.useMockApi
    ? MockOrganisationTypeApiService
    : HttpOrganisationTypeApiService,
};
