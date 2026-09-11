import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpCommissionApiService } from './http-commission-api.service';
import { MockCommissionApiService } from './mock-commission-api.service';
import { CommissionApi } from './commission-api.abstract';

/** Binds {@link CommissionApi} to the mock or HTTP implementation. */
export const commissionApiProvider: Provider = {
  provide: CommissionApi,
  useClass: environment.useMockApi ? MockCommissionApiService : HttpCommissionApiService,
};
