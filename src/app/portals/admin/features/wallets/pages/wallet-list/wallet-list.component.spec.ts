import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { WalletsModule } from '../../wallets.module';
import { walletsList } from '../../store/wallets.list';
import { WalletListComponent } from './wallet-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/wallet',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [WalletsModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store), router: routerStub };
}

describe('WalletListComponent', () => {
  it('loads wallets and navigates to the detail on row activation', async () => {
    const { router } = configure();
    const fixture = TestBed.createComponent(WalletListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();

    const firstRow = fixture.nativeElement.querySelector('tbody tr') as HTMLElement;
    expect(firstRow).toBeTruthy();
    firstRow.click();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/wallet', expect.any(String)]);
  }, 20000);

  it('owner-type filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(WalletListComponent);
    fixture.detectChanges();
    await wait(800);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const select = fixture.nativeElement.querySelector(
      'app-select-field select',
    ) as HTMLSelectElement;
    select.value = 'ORGANISATION';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: walletsList.actions.filtersChanged.type }),
    );
  }, 20000);
});
