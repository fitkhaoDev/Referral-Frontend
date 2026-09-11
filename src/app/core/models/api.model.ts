/**
 * Cross-cutting API primitives shared by every data-access contract.
 *
 * These shapes ARE part of the API specification that will be handed to the backend
 * team. Keep them stable; changing them changes the contract for all endpoints.
 */

export type Id = string;

/** ISO-8601 timestamp string, always UTC (`2026-09-08T10:15:30.000Z`). */
export type IsoDateTime = string;
/** Calendar date, no time component (`2026-09-08`). */
export type IsoDate = string;

export type SortDirection = 'asc' | 'desc';

export interface SortSpec {
  readonly field: string;
  readonly direction: SortDirection;
}

/**
 * Standard list query. Every paginated endpoint accepts this, serialised to query
 * params: `?page=0&size=20&sort=createdAt,desc&search=apollo&<filterKey>=<value>`.
 */
export interface PageQuery {
  /** Zero-based page index. */
  readonly page: number;
  /** Page size (backend clamps to an allowed maximum). */
  readonly size: number;
  /** Optional multi-column sort; serialised as repeated `sort=field,dir` params. */
  readonly sort?: readonly SortSpec[];
  /** Free-text search term; server decides which fields it spans per resource. */
  readonly search?: string;
  /** Resource-specific filters; `null`/`undefined` entries are omitted from the query. */
  readonly filters?: Readonly<Record<string, string | number | boolean | null | undefined>>;
}

/** Standard envelope for a page of results. */
export interface Page<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly size: number;
  /** Total matching records across all pages. */
  readonly totalItems: number;
  readonly totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 20;

export function emptyPage<T>(query?: Partial<PageQuery>): Page<T> {
  return {
    items: [],
    page: query?.page ?? 0,
    size: query?.size ?? DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  };
}

/**
 * Normalised error surfaced by the HTTP error interceptor. Feature code and the UI
 * only ever see this shape — never a raw `HttpErrorResponse` or backend stack trace.
 */
export interface ApiError {
  /** HTTP status, or 0 for network/timeout/abort. */
  readonly status: number;
  /** Stable machine code from the backend error body when present (e.g. `WITHDRAWAL_BELOW_MINIMUM`). */
  readonly code: string;
  /** Human-safe message suitable for display. Never a technical/internal string. */
  readonly message: string;
  /** Field-level validation errors, keyed by form control name, when status is 422/400. */
  readonly fieldErrors?: Readonly<Record<string, string[]>>;
  /** Correlation id echoed from the request, for support/debugging. */
  readonly correlationId?: string;
  /** Original payload for logging (never rendered). */
  readonly raw?: unknown;
}

export type Result<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: ApiError };
