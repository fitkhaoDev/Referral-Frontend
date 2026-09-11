import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { ORGANISATION_SEED } from '../../../_fixtures/organisation-catalog';
import { OrganisationsModule } from '../../organisations.module';
import { OrganisationActions } from '../../store/organisations.actions';
import { OrganisationDetailComponent } from './organisation-detail.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  TestBed.configureTestingModule({
    imports: [
      OrganisationsModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('OrganisationDetailComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads the organisation and its member preview', async () => {
    const apollo = ORGANISATION_SEED[0];
    const { store } = configure();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(OrganisationDetailComponent);
    fixture.componentRef.setInput('id', apollo.id);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(OrganisationActions.loadDetail({ id: apollo.id }));

    await wait(900);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('APOLLO-DUMDUM');
    expect(fixture.nativeElement.querySelector('.members__list')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Dr. John Doe');
  }, 20000);

  it('links "Manage members" to the members screen scoped by organisation', async () => {
    const apollo = ORGANISATION_SEED[0];
    configure();
    const fixture = TestBed.createComponent(OrganisationDetailComponent);
    fixture.componentRef.setInput('id', apollo.id);
    fixture.detectChanges();
    await wait(900);
    fixture.detectChanges();

    const link = Array.from(fixture.nativeElement.querySelectorAll('a')).find((a) =>
      (a as HTMLElement).textContent?.includes('Manage members'),
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/admin/organisation-members');
    expect(link.getAttribute('href')).toContain(`organisationId=${apollo.id}`);
  }, 20000);
});
