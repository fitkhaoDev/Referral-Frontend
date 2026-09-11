import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { CommissionsModule } from '../../commissions.module';
import { commissionsList } from '../../store/commissions.list';
import { CommissionListComponent } from './commission-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/commissions',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [CommissionsModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('CommissionListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads commissions and opens the rule-snapshot detail on row activation', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(CommissionListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('tbody tr') as HTMLElement).click();
    fixture.detectChanges();
    const dialog = overlay.querySelector('app-commission-detail-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog!.textContent).toContain('Rule snapshot');
  }, 20000);

  it('status filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(CommissionListComponent);
    fixture.detectChanges();
    await wait(800);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const select = fixture.nativeElement.querySelector('app-select-field select') as HTMLSelectElement;
    select.value = 'REVERSED';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: commissionsList.actions.filtersChanged.type }),
    );
  }, 20000);
});
