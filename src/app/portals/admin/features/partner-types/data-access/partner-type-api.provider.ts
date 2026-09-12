import { Provider } from '@angular/core';
import { HttpPartnerTypeApiService } from './http-partner-type-api.service';
import { PartnerTypeApi } from './partner-type-api.abstract';

/** Binds {@link PartnerTypeApi} to the real HTTP implementation. */
export const partnerTypeApiProvider: Provider = {
  provide: PartnerTypeApi,
  useClass: HttpPartnerTypeApiService,
};
