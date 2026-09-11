import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { AuthApi } from './auth-api.abstract';
import { HttpAuthApiService } from './http-auth-api.service';
import { MockAuthApiService } from './mock-auth-api.service';

/**
 * Binds {@link AuthApi} to the mock or HTTP implementation based on
 * `environment.useMockApi`. Registered once in {@link CoreModule} so guards, effects
 * and components share one instance. Flipping the flag switches every auth call to
 * the real backend with no consumer changes.
 */
export const authApiProvider: Provider = {
  provide: AuthApi,
  useClass: environment.useMockApi ? MockAuthApiService : HttpAuthApiService,
};
