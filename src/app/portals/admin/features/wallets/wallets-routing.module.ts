import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletDetailComponent } from './pages/wallet-detail/wallet-detail.component';
import { WalletListComponent } from './pages/wallet-list/wallet-list.component';

const routes: Routes = [
  { path: '', component: WalletListComponent, title: 'Wallets · FitKhao Admin' },
  { path: ':id', component: WalletDetailComponent, title: 'Wallet · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WalletsRoutingModule {}
