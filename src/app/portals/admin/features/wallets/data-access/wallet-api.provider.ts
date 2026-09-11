import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { HttpWalletApiService } from './http-wallet-api.service';
import { MockWalletApiService } from './mock-wallet-api.service';
import { WalletApi } from './wallet-api.abstract';

/** Binds {@link WalletApi} to the mock or HTTP implementation. */
export const walletApiProvider: Provider = {
  provide: WalletApi,
  useClass: environment.useMockApi ? MockWalletApiService : HttpWalletApiService,
};
