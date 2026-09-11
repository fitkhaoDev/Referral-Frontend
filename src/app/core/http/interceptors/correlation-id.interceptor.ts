import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** Correlation id header name, echoed back by the backend and surfaced in ApiError. */
export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

function newCorrelationId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `cid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Tags every outbound request with a correlation id for tracing and support. */
@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.headers.has(CORRELATION_ID_HEADER)) {
      return next.handle(req);
    }
    return next.handle(
      req.clone({ setHeaders: { [CORRELATION_ID_HEADER]: newCorrelationId() } }),
    );
  }
}
