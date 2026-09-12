import { AppEnvironment } from './app-environment';

/**
 * Production environment.
 *
 * `useMockApi` MUST be `false` here. The mock data layer is a development aid only;
 * it never ships. When the real backend exists, only `apiBaseUrl` needs updating.
 */
export const environment: AppEnvironment = {
  production: true,
  useMockApi: false,
  apiBaseUrl: 'http://localhost:7071/api',
  apiVersion: 'v1',
  mockLatencyMs: [0, 0],
  locale: 'en-IN',
  currency: 'INR',
};
