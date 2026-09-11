import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { OrganisationsModule } from '../../organisations.module';
import { OrganisationListComponent } from './organisation-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/organisations',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [OrganisationsModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store), router: TestBed.inject(Router) };
}

describe('OrganisationListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads organisations with their referral code and member count', async () => {
    configure();
    const fixture = TestBed.createComponent(OrganisationListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('APOLLO-DUMDUM');
    expect(fixture.nativeElement.querySelectorAll('tbody tr, .dt-card').length).toBeGreaterThan(0);
  }, 20000);

  it('navigates to enrol on the header action', async () => {
    const { router } = configure();
    const fixture = TestBed.createComponent(OrganisationListComponent);
    fixture.detectChanges();
    await wait(800);
    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/organisations/new']);
  }, 20000);
});
