import { AppEnvironment } from './app-environment';

/**
 * Development environment.
 *
 * `useMockApi: true` runs the entire application against hand-authored fixtures with
 * realistic latency, pagination and error behaviour — no backend process required.
 * Set to `false` (and point `apiBaseUrl` at a running backend) to develop against the
 * real API once it exists.
 */
export const environment: AppEnvironment = {
  production: false,
  useMockApi: true,
  apiBaseUrl: 'http://localhost:8080/api',
  mockLatencyMs: [180, 520],
  locale: 'en-IN',
  currency: 'INR',
};
