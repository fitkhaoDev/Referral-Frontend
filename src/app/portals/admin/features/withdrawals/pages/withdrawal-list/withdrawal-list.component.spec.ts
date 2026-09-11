import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { WithdrawalsModule } from '../../withdrawals.module';
import { withdrawalsList } from '../../store/withdrawals.list';
import { WithdrawalListComponent } from './withdrawal-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/withdrawals',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [WithdrawalsModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store), router: routerStub };
}

describe('WithdrawalListComponent', () => {
  it('renders the backend policy banner and lists withdrawals', async () => {
    configure();
    const fixture = TestBed.createComponent(WithdrawalListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Withdrawal policy');
    expect(text).toContain('per calendar month');
    expect(fixture.nativeElement.querySelector('tbody tr')).toBeTruthy();
  }, 20000);

  it('navigates to the detail on row activation', async () => {
    const { router } = configure();
    const fixture = TestBed.createComponent(WithdrawalListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('tbody tr') as HTMLElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/withdrawals', expect.any(String)]);
  }, 20000);

  it('status filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(WithdrawalListComponent);
    fixture.detectChanges();
    await wait(800);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const select = fixture.nativeElement.querySelector('app-select-field select') as HTMLSelectElement;
    select.value = 'PAID';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: withdrawalsList.actions.filtersChanged.type }),
    );
  }, 20000);
});
