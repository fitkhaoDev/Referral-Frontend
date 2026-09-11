import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { WalletTransactionDialogComponent } from './components/wallet-transaction-dialog/wallet-transaction-dialog.component';
import { walletApiProvider } from './data-access/wallet-api.provider';
import { WalletDetailComponent } from './pages/wallet-detail/wallet-detail.component';
import { WalletListComponent } from './pages/wallet-list/wallet-list.component';
import { WalletsRoutingModule } from './wallets-routing.module';
import { walletLedgerList } from './store/wallet-ledger.list';
import { WALLETS_DETAIL_KEY, walletsDetailReducer } from './store/wallets.detail.reducer';
import { WalletsEffects } from './store/wallets.effects';
import { WalletsFacade } from './store/wallets.facade';
import { walletsList } from './store/wallets.list';

/** Admin → Wallets feature (read-only owner directory + ledger). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    WalletsRoutingModule,
    StoreModule.forFeature(walletsList.name, walletsList.reducer),
    StoreModule.forFeature(walletLedgerList.name, walletLedgerList.reducer),
    StoreModule.forFeature(WALLETS_DETAIL_KEY, walletsDetailReducer),
    EffectsModule.forFeature([WalletsEffects]),
  ],
  declarations: [WalletListComponent, WalletDetailComponent, WalletTransactionDialogComponent],
  providers: [walletApiProvider, WalletsFacade],
})
export class WalletsModule {}
