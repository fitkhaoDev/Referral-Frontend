import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { DiscountRulesModule } from '../../discount-rules.module';
import { discountRulesList } from '../../store/discount-rules.list';
import { DiscountRuleListComponent } from './discount-rule-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/discount-rules',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [DiscountRulesModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ],
  });
  return { store: TestBed.inject(Store) };
}

describe('DiscountRuleListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('renders human discount summaries', async () => {
    configure();
    const fixture = TestBed.createComponent(DiscountRuleListComponent);
    fixture.detectChanges();
    await wait(800);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('10%');
    expect(text).toContain('No discount');
  }, 20000);

  it('opens the create dialog', async () => {
    configure();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(DiscountRuleListComponent);
    fixture.detectChanges();
    await wait(800);
    (
      fixture.nativeElement.querySelector('app-page-header app-button button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-discount-rule-form-dialog')).toBeTruthy();
  }, 20000);

  it('scope filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(DiscountRuleListComponent);
    fixture.detectChanges();
    await wait(800);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const select = fixture.nativeElement.querySelector('app-select-field select') as HTMLSelectElement;
    select.value = 'ORGANISATION';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: discountRulesList.actions.filtersChanged.type }),
    );
  }, 20000);
});
