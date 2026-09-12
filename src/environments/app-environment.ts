/**
 * Environment contract shared by every environment file.
 *
 * Kept in its own module because `environment.ts` is swapped out by the build's
 * `fileReplacements`; the interface must live somewhere that is never replaced.
 */
export interface AppEnvironment {
  readonly production: boolean;
  /** When true, the swappable data-access layer binds to in-memory mock implementations. */
  readonly useMockApi: boolean;
  /** Base URL for all backend calls, no trailing slash. */
  readonly apiBaseUrl: string;
  readonly apiVersion: string;
  /** Simulated latency range (ms) for the mock layer. Ignored when useMockApi is false. */
  readonly mockLatencyMs: readonly [number, number];
  /** Locale used for currency/date formatting across the app. */
  readonly locale: string;
  /** ISO 4217 currency code. */
  readonly currency: string;
}
