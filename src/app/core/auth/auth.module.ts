import { APP_INITIALIZER, NgModule, NgZone } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { authApiProvider } from './services/auth-api.provider';
import { SessionStorageService } from './services/session-storage.service';
import { AuthActions } from './store/auth.actions';
import { AuthEffects } from './store/auth.effects';
import { authFeature } from './store/auth.reducer';

/**
 * Hydrates both audience sessions from storage before the router runs, so guards see
 * the correct session on the first navigation.
 *
 * `APP_INITIALIZER` factories run outside the Angular zone during bootstrap, so the
 * dispatch is wrapped in `zone.run` to satisfy NgRx's `strictActionWithinNgZone`
 * runtime check (kept on for every other code path).
 */
export function hydrateAuthFactory(store: Store, storage: SessionStorageService, zone: NgZone) {
  return () =>
    zone.run(() =>
      store.dispatch(
        AuthActions.hydrate({ admin: storage.read('admin'), partner: storage.read('partner') }),
      ),
    );
}

@NgModule({
  imports: [StoreModule.forFeature(authFeature), EffectsModule.forFeature([AuthEffects])],
  providers: [
    authApiProvider,
    {
      provide: APP_INITIALIZER,
      useFactory: hydrateAuthFactory,
      deps: [Store, SessionStorageService, NgZone],
      multi: true,
    },
  ],
})
export class AuthModule {}
