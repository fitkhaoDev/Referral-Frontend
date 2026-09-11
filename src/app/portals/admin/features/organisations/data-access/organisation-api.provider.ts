import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpOrganisationApiService } from './http-organisation-api.service';
import { MockOrganisationApiService } from './mock-organisation-api.service';
import { OrganisationApi } from './organisation-api.abstract';

/** Binds {@link OrganisationApi} to the mock or HTTP implementation. */
export const organisationApiProvider: Provider = {
  provide: OrganisationApi,
  useClass: environment.useMockApi ? MockOrganisationApiService : HttpOrganisationApiService,
};
