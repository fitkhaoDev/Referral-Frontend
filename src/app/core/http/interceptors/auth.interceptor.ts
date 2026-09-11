import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.token';
import { SessionTokenService } from '../services/session-token.service';

/**
 * Attaches the correct audience bearer token to backend requests.
 *
 * The audience is inferred from the URL (`/admin/**` vs `/partner/**`), so an admin
 * token is never sent on a partner request or vice-versa. Auth endpoints
 * (`login`, `refresh`) are left unauthenticated.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly config = inject(APP_CONFIG);
  private readonly tokens = inject(SessionTokenService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiCall = req.url.startsWith(this.config.apiBaseUrl) || req.url.startsWith('/api');
    if (!isApiCall) {
      return next.handle(req);
    }

    const isPublicAuthCall = /\/auth\/(login|refresh)$/.test(req.url);
    if (isPublicAuthCall || req.headers.has('Authorization')) {
      return next.handle(req);
    }

    const audience = this.tokens.audienceForUrl(req.url);
    const bearer = audience ? this.tokens.bearerFor(audience) : null;
    if (!bearer) {
      return next.handle(req);
    }

    return next.handle(req.clone({ setHeaders: { Authorization: bearer } }));
  }
}
