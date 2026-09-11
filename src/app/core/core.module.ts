import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEnIn from '@angular/common/locales/en-IN';
import { ErrorHandler, LOCALE_ID, NgModule, Optional, SkipSelf } from '@angular/core';
import { environment } from '@env/environment';
import { AuthModule } from './auth/auth.module';
import { APP_CONFIG } from './config/app-config.token';
import { GlobalErrorHandler } from './error/global-error-handler';
import { httpInterceptorProviders } from './http/interceptors/http-interceptors.providers';

registerLocaleData(localeEnIn);

/**
 * Eagerly-loaded singletons: HTTP client + interceptor chain, global error handler,
 * locale/currency config, and the app-wide auth slice. Imported exactly once by
 * {@link AppModule}; the re-import guard prevents accidental inclusion elsewhere.
 */
@NgModule({
  imports: [HttpClientModule, AuthModule],
  providers: [
    ...httpInterceptorProviders,
    { provide: APP_CONFIG, useValue: environment },
    { provide: LOCALE_ID, useValue: environment.locale },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
