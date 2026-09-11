import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnersModule } from '../../partners.module';
import { partnersList } from '../../store/partners.list';
import { PartnerListComponent } from './partner-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/partners',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [PartnersModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store), router: TestBed.inject(Router) };
}

describe('PartnerListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads partners and shows a temp-password badge where applicable', async () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr, .dt-card').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('Temp password');
  }, 20000);

  it('navigates to the enrol page from the header action', async () => {
    const { router } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/partners/new']);
  }, 20000);

  it('type filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const typeSelect = fixture.nativeElement.querySelectorAll('app-select-field select')[1] as HTMLSelectElement;
    typeSelect.value = typeSelect.options[1]?.value ?? '';
    typeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnersList.actions.filtersChanged.type }),
    );
  });
});
