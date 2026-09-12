import { Provider } from '@angular/core';
import { HttpPartnerApiService } from './http-partner-api.service';
import { PartnerApi } from './partner-api.abstract';

/** Binds {@link PartnerApi} to the real HTTP implementation. */
export const partnerApiProvider: Provider = {
  provide: PartnerApi,
  useClass: HttpPartnerApiService,
};
