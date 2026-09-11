import {
  HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Set on a request's context to keep it out of the global loading indicator. */
export const SILENT_REQUEST = new HttpContextToken<boolean>(() => false);

/** Increments the global in-flight counter for the lifetime of each request. */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly loading = inject(LoadingService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.context.get(SILENT_REQUEST)) {
      return next.handle(req);
    }
    this.loading.begin();
    return next.handle(req).pipe(finalize(() => this.loading.end()));
  }
}
