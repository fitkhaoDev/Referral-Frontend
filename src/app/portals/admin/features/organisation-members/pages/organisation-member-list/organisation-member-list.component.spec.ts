import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { ORGANISATION_SEED } from '../../../_fixtures/organisation-catalog';
import { OrganisationMembersModule } from '../../organisation-members.module';
import { organisationMembersList } from '../../store/organisation-members.list';
import { OrganisationMemberListComponent } from './organisation-member-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure(params: Record<string, string> = {}) {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/organisation-members',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [OrganisationMembersModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('OrganisationMemberListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('pre-filters by organisationId from the URL', async () => {
    const apollo = ORGANISATION_SEED[0];
    const { store } = configure({ organisationId: apollo.id });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(OrganisationMemberListComponent);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      organisationMembersList.actions.querySetFromUrl({
        query: expect.objectContaining({ filters: { organisationId: apollo.id } }),
      }),
    );

    await wait(700);
    fixture.detectChanges();
    const codes = Array.from(fixture.nativeElement.querySelectorAll('tbody code')).map((c) =>
      (c as HTMLElement).textContent,
    );
    expect(codes.every((c) => c === apollo.referralCode)).toBe(true);
  }, 20000);

  it('opens the add-member dialog', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(OrganisationMemberListComponent);
    fixture.detectChanges();
    await wait(700);
    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-organisation-member-form-dialog')).toBeTruthy();
  }, 20000);
});
