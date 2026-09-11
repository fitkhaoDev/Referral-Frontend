import { Injectable } from '@angular/core';
import { Audience, AuthSession } from '../models/auth.model';

const STORAGE_KEY: Record<Audience, string> = {
  admin: 'fk.session.admin.v1',
  partner: 'fk.session.partner.v1',
};

/**
 * Per-audience session persistence.
 *
 * Admin and Partner sessions are stored under SEPARATE keys so the two portals stay
 * isolated in the same browser. `localStorage` keeps the user signed in across a
 * refresh; every access is guarded because storage can be unavailable (private
 * mode, blocked site data) or throw.
 */
@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  read(audience: Audience): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY[audience]);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.audience !== audience || !parsed.accessToken) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  write(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY[session.audience], JSON.stringify(session));
    } catch {
      /* storage unavailable — session simply won't survive a reload */
    }
  }

  clear(audience: Audience): void {
    try {
      localStorage.removeItem(STORAGE_KEY[audience]);
    } catch {
      /* no-op */
    }
  }
}
