import { Injectable, inject } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { ReferralApi } from '../data-access/referral-api.abstract';
import { referralsList } from './referrals.list';

@Injectable()
export class ReferralsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(ReferralApi);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, referralsList, (query) => this.api.list(query)),
  );
}
