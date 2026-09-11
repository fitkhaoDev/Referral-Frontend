import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { ReferralsModule } from '../../referrals.module';
import { referralsList } from '../../store/referrals.list';
import { ReferralListComponent } from './referral-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure(params: Record<string, string> = {}) {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/referrals',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [ReferralsModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('ReferralListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads referrals and opens a detail dialog on row activation', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(ReferralListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();

    const firstRow = fixture.nativeElement.querySelector('tbody tr') as HTMLElement;
    expect(firstRow).toBeTruthy();
    firstRow.click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-referral-detail-dialog')).toBeTruthy();
  }, 20000);

  it('date range filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(ReferralListComponent);
    fixture.detectChanges();
    await wait(800);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const fromInput = fixture.nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    fromInput.value = '2026-06-01';
    fromInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: referralsList.actions.filtersChanged.type }),
    );
  }, 20000);
});
