import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpPartnerApiService } from './http-partner-api.service';
import { MockPartnerApiService } from './mock-partner-api.service';
import { PartnerApi } from './partner-api.abstract';

/** Binds {@link PartnerApi} to the mock or HTTP implementation. Registered in `PartnersModule`. */
export const partnerApiProvider: Provider = {
  provide: PartnerApi,
  useClass: environment.useMockApi ? MockPartnerApiService : HttpPartnerApiService,
};
