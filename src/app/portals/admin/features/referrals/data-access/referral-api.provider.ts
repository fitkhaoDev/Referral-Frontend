import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpReferralApiService } from './http-referral-api.service';
import { MockReferralApiService } from './mock-referral-api.service';
import { ReferralApi } from './referral-api.abstract';

/** Binds {@link ReferralApi} to the mock or HTTP implementation. */
export const referralApiProvider: Provider = {
  provide: ReferralApi,
  useClass: environment.useMockApi ? MockReferralApiService : HttpReferralApiService,
};
