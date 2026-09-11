import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { OrganisationTypesModule } from '../../organisation-types.module';
import { organisationTypesList } from '../../store/organisation-types.list';
import { OrganisationTypeListComponent } from './organisation-type-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/organisation-types',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [OrganisationTypesModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('OrganisationTypeListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  });

  it('hydrates from the URL and loads rows', async () => {
    const { store } = configure();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(OrganisationTypeListComponent);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: organisationTypesList.actions.querySetFromUrl.type }),
    );

    await wait(700);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr, .dt-card').length).toBeGreaterThan(0);
  });

  it('opens the create dialog', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(OrganisationTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-organisation-type-form-dialog')).toBeTruthy();
  });
});
