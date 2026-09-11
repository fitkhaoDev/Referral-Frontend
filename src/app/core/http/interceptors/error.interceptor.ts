import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, catchError, throwError } from 'rxjs';
import { fromHttpError } from '../../models/api-error.util';
import { AuthActions } from '../../auth/store/auth.actions';
import { SessionTokenService } from '../services/session-token.service';
import { CORRELATION_ID_HEADER } from './correlation-id.interceptor';

/**
 * Normalises every transport failure into an {@link ApiError} so feature code and the
 * UI never see a raw `HttpErrorResponse` or backend internals.
 *
 * A `401` on an *authenticated* request ends that audience's session (reason
 * `expired`); a `403` is surfaced but does not sign the user out.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly store = inject(Store);
  private readonly tokens = inject(SessionTokenService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        const correlationId = req.headers.get(CORRELATION_ID_HEADER) ?? undefined;
        const normalised = fromHttpError(err, correlationId);

        if (normalised.status === 401 && req.headers.has('Authorization')) {
          const audience = this.tokens.audienceForUrl(req.url);
          if (audience) {
            this.store.dispatch(AuthActions.logout({ audience, reason: 'expired' }));
          }
        }

        return throwError(() => normalised);
      }),
    );
  }
}
