import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { WalletsModule } from '../../wallets.module';
import { WalletActions } from '../../store/wallets.actions';
import { walletLedgerList } from '../../store/wallet-ledger.list';
import { WalletDetailComponent } from './wallet-detail.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const FIRST_WALLET_ID = 'wallet-000001';

function configure() {
  TestBed.configureTestingModule({
    imports: [
      WalletsModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('WalletDetailComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads the summary and points the ledger at the wallet', async () => {
    const { store } = configure();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(WalletDetailComponent);
    fixture.componentRef.setInput('id', FIRST_WALLET_ID);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(WalletActions.loadSummary({ id: FIRST_WALLET_ID }));
    expect(dispatchSpy).toHaveBeenCalledWith(
      walletLedgerList.actions.filtersChanged({ filters: { walletId: FIRST_WALLET_ID } }),
    );

    await wait(900);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dr. John Doe');
    expect(fixture.nativeElement.textContent).toContain('Available to withdraw');
    expect(fixture.nativeElement.querySelector('tbody tr')).toBeTruthy();
  }, 20000);

  it('opens the transaction dialog on row activation', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(WalletDetailComponent);
    fixture.componentRef.setInput('id', FIRST_WALLET_ID);
    fixture.detectChanges();
    await wait(900);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('tbody tr') as HTMLElement).click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-wallet-transaction-dialog')).toBeTruthy();
  }, 20000);

  it('type filter dispatches filtersChanged on the ledger feature', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(WalletDetailComponent);
    fixture.componentRef.setInput('id', FIRST_WALLET_ID);
    fixture.detectChanges();
    await wait(900);
    fixture.detectChanges();

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const select = fixture.nativeElement.querySelector(
      'app-select-field select',
    ) as HTMLSelectElement;
    select.value = 'WITHDRAWAL';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: walletLedgerList.actions.filtersChanged.type }),
    );
  }, 20000);
});
