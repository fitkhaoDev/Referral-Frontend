import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpIncentiveRuleApiService } from './http-incentive-rule-api.service';
import { MockIncentiveRuleApiService } from './mock-incentive-rule-api.service';
import { IncentiveRuleApi } from './incentive-rule-api.abstract';

/** Binds {@link IncentiveRuleApi} to the mock or HTTP implementation. */
export const incentiveRuleApiProvider: Provider = {
  provide: IncentiveRuleApi,
  useClass: environment.useMockApi ? MockIncentiveRuleApiService : HttpIncentiveRuleApiService,
};
