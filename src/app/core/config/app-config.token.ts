import { InjectionToken } from '@angular/core';
import { AppEnvironment } from '@env/app-environment';
import { environment } from '@env/environment';

/**
 * Application configuration token.
 *
 * Wraps the build-time `environment` so consumers depend on an injectable contract
 * (trivially overridable in tests) rather than importing `environment` directly. If
 * a runtime `/config` endpoint is added later, its response is merged here at
 * bootstrap without touching consumers.
 */
export type AppConfig = AppEnvironment;

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
