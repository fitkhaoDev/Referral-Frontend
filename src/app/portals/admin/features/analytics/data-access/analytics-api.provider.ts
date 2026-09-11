import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { AnalyticsApi } from './analytics-api.abstract';
import { HttpAnalyticsApiService } from './http-analytics-api.service';
import { MockAnalyticsApiService } from './mock-analytics-api.service';

/** Binds {@link AnalyticsApi} to the mock or HTTP implementation. */
export const analyticsApiProvider: Provider = {
  provide: AnalyticsApi,
  useClass: environment.useMockApi ? MockAnalyticsApiService : HttpAnalyticsApiService,
};
