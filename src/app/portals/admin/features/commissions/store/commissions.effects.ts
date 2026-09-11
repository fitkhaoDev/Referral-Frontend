import { Injectable, inject } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { CommissionApi } from '../data-access/commission-api.abstract';
import { commissionsList } from './commissions.list';

@Injectable()
export class CommissionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(CommissionApi);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, commissionsList, (query) => this.api.list(query)),
  );
}
