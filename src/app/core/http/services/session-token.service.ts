import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Audience } from '../../auth/models/auth.model';
import { selectSession } from '../../auth/store/auth.selectors';

/**
 * Synchronous, injection-context-free access to the current bearer token per
 * audience, for use inside HTTP interceptors. Kept in sync with the auth store.
 */
@Injectable({ providedIn: 'root' })
export class SessionTokenService {
  private readonly store = inject(Store);
  private readonly adminSession = toSignal(this.store.select(selectSession('admin')), {
    initialValue: null,
  });
  private readonly partnerSession = toSignal(this.store.select(selectSession('partner')), {
    initialValue: null,
  });

  /** Infer the audience a request targets from its URL. */
  audienceForUrl(url: string): Audience | null {
    if (/\/admin(\/|$|\?)/.test(url)) return 'admin';
    if (/\/partner(\/|$|\?)/.test(url)) return 'partner';
    return null;
  }

  bearerFor(audience: Audience): string | null {
    const session = audience === 'admin' ? this.adminSession() : this.partnerSession();
    return session ? `${session.tokenType} ${session.accessToken}` : null;
  }
}
