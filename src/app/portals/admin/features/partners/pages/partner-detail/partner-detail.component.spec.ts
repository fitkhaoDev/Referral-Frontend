import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnersModule } from '../../partners.module';
import { PartnerActions } from '../../store/partners.actions';
import { PartnerDetailComponent } from './partner-detail.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  TestBed.configureTestingModule({
    imports: [
      PartnersModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('PartnerDetailComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('dispatches loadDetail for the bound id and renders the partner', async () => {
    const { store } = configure();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(PartnerDetailComponent);
    fixture.componentRef.setInput('id', 'partner-000001');
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(PartnerActions.loadDetail({ id: 'partner-000001' }));

    await wait(700);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('FK-IND-000001');
    expect(fixture.nativeElement.querySelector('dl.detail')).toBeTruthy();
  }, 20000);

  it('swaps to the edit form and back on update success', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerDetailComponent);
    fixture.componentRef.setInput('id', 'partner-000001');
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();

    const editBtn = Array.from(
      fixture.nativeElement.querySelectorAll('app-page-header app-button button'),
    ).find((b) => (b as HTMLElement).textContent?.includes('Edit details')) as HTMLButtonElement;
    editBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-partner-form')).toBeTruthy();

    store.dispatch(
      PartnerActions.updateSuccess({
        partner: {
          id: 'partner-000001',
          partnerId: 'FK-IND-000001',
          name: 'Changed Name',
          partnerTypeId: 'ptype-000001',
          partnerTypeName: 'Doctor',
          partnerTypeCode: 'DOCTOR',
          mobile: '+91 9000000001',
          email: 'john@example.com',
          referralCode: 'JOHNDOC10',
          status: 'ACTIVE',
          passwordState: 'OK',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-partner-form')).toBeNull();
  });
});
