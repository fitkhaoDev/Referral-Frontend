import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { WithdrawalActionDialogComponent } from './components/withdrawal-action-dialog/withdrawal-action-dialog.component';
import { withdrawalApiProvider } from './data-access/withdrawal-api.provider';
import { WithdrawalsOptionsService } from './data-access/withdrawals-options.service';
import { WithdrawalDetailComponent } from './pages/withdrawal-detail/withdrawal-detail.component';
import { WithdrawalListComponent } from './pages/withdrawal-list/withdrawal-list.component';
import { WithdrawalsRoutingModule } from './withdrawals-routing.module';
import {
  WITHDRAWALS_DETAIL_KEY,
  withdrawalsDetailReducer,
} from './store/withdrawals.detail.reducer';
import { WithdrawalsEffects } from './store/withdrawals.effects';
import { WithdrawalsFacade } from './store/withdrawals.facade';
import { withdrawalsList } from './store/withdrawals.list';

/** Admin → Withdrawals feature (review + process payout requests). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    WithdrawalsRoutingModule,
    StoreModule.forFeature(withdrawalsList.name, withdrawalsList.reducer),
    StoreModule.forFeature(WITHDRAWALS_DETAIL_KEY, withdrawalsDetailReducer),
    EffectsModule.forFeature([WithdrawalsEffects]),
  ],
  declarations: [
    WithdrawalListComponent,
    WithdrawalDetailComponent,
    WithdrawalActionDialogComponent,
  ],
  providers: [
    withdrawalApiProvider,
    organisationApiProvider,
    WithdrawalsOptionsService,
    WithdrawalsFacade,
  ],
})
export class WithdrawalsModule {}
