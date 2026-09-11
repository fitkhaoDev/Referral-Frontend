import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { ReferralEventsModule } from '../../referral-events.module';
import { referralEventsList } from '../../store/referral-events.list';
import { ReferralEventListComponent } from './referral-event-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/referral-events',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [ReferralEventsModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('ReferralEventListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  });

  it('loads rows sorted by display order', async () => {
    configure();
    const fixture = TestBed.createComponent(ReferralEventListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const firstCode = fixture.nativeElement.querySelector('tbody tr code, .dt-card code')?.textContent;
    expect(firstCode).toContain('REFERRAL_CREATED');
  });

  it('changing the Kind filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(ReferralEventListComponent);
    fixture.detectChanges();
    await wait(700);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const selects = fixture.nativeElement.querySelectorAll('app-select-field select');
    const kind = selects[selects.length - 1] as HTMLSelectElement;
    kind.value = 'false';
    kind.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: referralEventsList.actions.filtersChanged.type }),
    );
  });
});
