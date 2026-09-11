import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpReferralEventApiService } from './http-referral-event-api.service';
import { MockReferralEventApiService } from './mock-referral-event-api.service';
import { ReferralEventApi } from './referral-event-api.abstract';

/** Binds {@link ReferralEventApi} to the mock or HTTP implementation. Registered in `ReferralEventsModule`. */
export const referralEventApiProvider: Provider = {
  provide: ReferralEventApi,
  useClass: environment.useMockApi ? MockReferralEventApiService : HttpReferralEventApiService,
};
