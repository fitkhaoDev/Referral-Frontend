import { NgModule, isDevMode } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

/**
 * Root NgRx registration. Feature slices are registered by their own feature
 * modules via `StoreModule.forFeature` / `EffectsModule.forFeature`.
 */
@NgModule({
  imports: [
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
          strictStateSerializability: true,
          strictActionSerializability: false,
          // strictActionWithinNgZone is intentionally OFF: it is a meta-reducer that
          // asserts NgZone.isInAngularZone() on every action, but StoreDevtoolsModule's
          // `recomputeStates` replays the whole action log through the reducer pipeline
          // from an RxJS scan callback that is NOT in the Angular zone. With the check on,
          // that replay throws on the first action and aborts — so the store never
          // reflects post-bootstrap actions (e.g. loginSuccess), auth guards then deny,
          // and navigation after login silently fails. The other strict checks stay on.
          strictActionWithinNgZone: false,
          strictActionTypeUniqueness: true,
        },
      },
    ),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 50,
      logOnly: !isDevMode(),
      connectInZone: true,
      name: 'FitKhao Referral',
    }),
  ],
})
export class AppStoreModule {}
