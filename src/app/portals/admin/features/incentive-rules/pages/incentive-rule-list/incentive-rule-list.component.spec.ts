import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { IncentiveRulesModule } from '../../incentive-rules.module';
import { incentiveRulesList } from '../../store/incentive-rules.list';
import { IncentiveRuleListComponent } from './incentive-rule-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/incentive-rules',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [IncentiveRulesModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('IncentiveRuleListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('summarises per-renewal tapering rules in the Renewals column', async () => {
    configure();
    const fixture = TestBed.createComponent(IncentiveRuleListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('#1 3%, #2 2%, #3 1%, then —');
    expect(text).toContain('3% every renewal');
  }, 20000);

  it('opens the create dialog with the full builder', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(IncentiveRuleListComponent);
    fixture.detectChanges();
    await wait(800);
    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-incentive-rule-form-dialog')).toBeTruthy();
    expect(overlay.querySelector('app-renewal-incentive-field')).toBeTruthy();
  }, 20000);

  it('beneficiary filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(IncentiveRuleListComponent);
    fixture.detectChanges();
    await wait(800);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const selects = fixture.nativeElement.querySelectorAll('app-select-field select');
    const beneficiary = selects[1] as HTMLSelectElement;
    beneficiary.value = 'DOCTOR';
    beneficiary.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: incentiveRulesList.actions.filtersChanged.type }),
    );
  }, 20000);
});
