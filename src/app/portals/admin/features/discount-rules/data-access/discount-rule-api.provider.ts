import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpDiscountRuleApiService } from './http-discount-rule-api.service';
import { MockDiscountRuleApiService } from './mock-discount-rule-api.service';
import { DiscountRuleApi } from './discount-rule-api.abstract';

/** Binds {@link DiscountRuleApi} to the mock or HTTP implementation. */
export const discountRuleApiProvider: Provider = {
  provide: DiscountRuleApi,
  useClass: environment.useMockApi ? MockDiscountRuleApiService : HttpDiscountRuleApiService,
};
