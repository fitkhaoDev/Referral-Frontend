import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnerTypesModule } from '../../partner-types.module';
import { partnerTypesList } from '../../store/partner-types.list';
import { PartnerTypeListComponent } from './partner-type-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/partner-types',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [PartnerTypesModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('PartnerTypeListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  });

  it('hydrates from the URL and loads the first page', async () => {
    const { store } = configure();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnerTypesList.actions.querySetFromUrl.type }),
    );

    await wait(700);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr, .dt-card').length).toBeGreaterThan(0);
  });

  it('opens the create dialog from the header action', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(overlay.querySelector('app-partner-type-form-dialog')).toBeTruthy();
  });

  it('debounced search dispatches searchChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const input = fixture.nativeElement.querySelector('input[type=search]') as HTMLInputElement;
    input.value = 'doctor';
    input.dispatchEvent(new Event('input'));
    await wait(400);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnerTypesList.actions.searchChanged({ search: 'doctor' }),
    );
  });
});
