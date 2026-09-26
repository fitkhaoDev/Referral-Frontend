import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './api.model';

/** Build a normalised {@link ApiError}. Used by both the mock layer and the HTTP interceptor. */
export function apiError(
  partial: Partial<ApiError> & Pick<ApiError, 'status' | 'code' | 'message'>,
): ApiError {
  return {
    status: partial.status,
    code: partial.code,
    message: partial.message,
    fieldErrors: partial.fieldErrors,
    correlationId: partial.correlationId,
    raw: partial.raw,
  };
}

const USER_SAFE_FALLBACK: Record<number, string> = {
  0: 'Cannot reach the server. Check your connection and try again.',
  400: 'The request was invalid. Please review the details and retry.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'This action conflicts with the current state. Refresh and try again.',
  422: 'Some details need your attention.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

/** Convert Angular's `HttpErrorResponse` into a user-safe {@link ApiError}. */
export function fromHttpError(err: HttpErrorResponse, correlationId?: string): ApiError {
  const status = err.status ?? 0;
  const body = err.error as
    | {
        code?: string;
        message?: string;
        errors?: Record<string, string[]>;
        fieldErrors?: Record<string, string[]>;
        /** ResponseBuilder shape: { error: { code, details } } */
        error?: { code?: string; details?: any };
      }
    | string
    | null;

  let code = `HTTP_${status}`;
  let message = USER_SAFE_FALLBACK[status] ?? USER_SAFE_FALLBACK[500];
  let fieldErrors: Record<string, string[]> | undefined;

  if (body && typeof body === 'object') {
    // Accept both flat `{ code }` and ResponseBuilder's `{ error: { code } }` shapes.
    if (body.code) code = body.code;
    else if (body.error?.code) code = body.error.code;
    // Only trust the backend message for client-error statuses; hide 5xx internals.
    if (body.message && status >= 400 && status < 500) message = body.message;
    // ResponseBuilder passes validation field errors through `error.details`.
    const detailErrors =
      body.error?.details && typeof body.error.details === 'object' && !Array.isArray(body.error.details)
        ? (body.error.details as Record<string, string[]>)
        : undefined;
    fieldErrors = body.fieldErrors ?? body.errors ?? detailErrors;
  }

  return { status, code, message, fieldErrors, correlationId, raw: err.error };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    !!value &&
    typeof value === 'object' &&
    'status' in value &&
    'code' in value &&
    'message' in value
  );
}
