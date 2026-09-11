import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpWithdrawalApiService } from './http-withdrawal-api.service';
import { MockWithdrawalApiService } from './mock-withdrawal-api.service';
import { WithdrawalApi } from './withdrawal-api.abstract';

/** Binds {@link WithdrawalApi} to the mock or HTTP implementation. */
export const withdrawalApiProvider: Provider = {
  provide: WithdrawalApi,
  useClass: environment.useMockApi ? MockWithdrawalApiService : HttpWithdrawalApiService,
};
