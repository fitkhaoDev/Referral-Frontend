import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpPartnerTypeApiService } from './http-partner-type-api.service';
import { MockPartnerTypeApiService } from './mock-partner-type-api.service';
import { PartnerTypeApi } from './partner-type-api.abstract';

/** Binds {@link PartnerTypeApi} to the mock or HTTP implementation. Registered in `PartnerTypesModule`. */
export const partnerTypeApiProvider: Provider = {
  provide: PartnerTypeApi,
  useClass: environment.useMockApi ? MockPartnerTypeApiService : HttpPartnerTypeApiService,
};
