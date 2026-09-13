import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnersModule } from '../../partners.module';
import { PartnerActions } from '../../store/partners.actions';
import { partnersList } from '../../store/partners.list';
import { PartnerListComponent } from './partner-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure(queryParams: Record<string, string> = {}) {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/partners',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [PartnersModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
      },
    ],
  });
  return { store: TestBed.inject(Store), router: TestBed.inject(Router) };
}

describe('PartnerListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
    TestBed.resetTestingModule();
  }, 20000);

  // ── Initialisation ─────────────────────────────────────────────────────────

  it('loads partners and renders rows', async () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr, .dt-card').length).toBeGreaterThan(0);
  }, 20000);

  it('loads partners and shows a temp-password badge where applicable', async () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Temp password');
  }, 20000);

  it('hydrates from the URL on init', async () => {
    const { store } = configure();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnersList.actions.querySetFromUrl.type }),
    );
  }, 20000);

  it('pre-fills status filter from URL query param', async () => {
    configure({ status: 'ACTIVE' });
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const component = fixture.componentInstance as any;
    expect(component.statusFilter.value).toBe('ACTIVE');
  }, 20000);

  // ── Navigation ─────────────────────────────────────────────────────────────

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

  it('view() navigates to the partner detail page', async () => {
    const { router } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as any;
    const partner = {
      id: 'p-1',
      name: 'Test',
      partnerId: 'P001',
      partnerTypeName: 'Doctor',
      status: 'ACTIVE',
      referralCode: 'REF001',
      mobile: '',
      email: '',
      passwordState: 'OK',
      createdAt: '',
      updatedAt: '',
    };
    component.view(partner);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/partners', 'p-1']);
  }, 20000);

  // ── Filters ────────────────────────────────────────────────────────────────

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
  }, 20000);

  it('status filter setValue dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.statusFilter.setValue('INACTIVE');
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnersList.actions.filtersChanged.type }),
    );
  }, 20000);

  it('password filter setValue dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.passwordFilter.setValue('MUST_CHANGE');
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnersList.actions.filtersChanged.type }),
    );
  }, 20000);

  it('clearFilters dispatches filtersCleared', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onClearFilters();

    expect(dispatchSpy).toHaveBeenCalledWith(partnersList.actions.filtersCleared());
  }, 20000);

  // ── Search, sort, page ─────────────────────────────────────────────────────

  it('debounced search dispatches searchChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    await wait(700);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const input = fixture.nativeElement.querySelector('input[type=search]') as HTMLInputElement;
    input.value = 'wellness';
    input.dispatchEvent(new Event('input'));
    await wait(400);
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnersList.actions.searchChanged({ search: 'wellness' }),
    );
  }, 20000);

  it('onSort dispatches sortChanged', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onSort([{ field: 'name', direction: 'asc' }]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnersList.actions.sortChanged({ sort: [{ field: 'name', direction: 'asc' }] }),
    );
  }, 20000);

  it('onPage dispatches pageChanged', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onPage({ page: 2, size: 20 });

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnersList.actions.pageChanged({ page: 2, size: 20 }),
    );
  }, 20000);

  it('onSearch dispatches searchChanged', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onSearch('john');

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnersList.actions.searchChanged({ search: 'john' }),
    );
  }, 20000);

  // ── Status helpers ─────────────────────────────────────────────────────────

  it('statusTone returns success for ACTIVE', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    const component = fixture.componentInstance as any;
    expect(component.statusTone('ACTIVE')).toBe('success');
  });

  it('statusTone returns neutral for INACTIVE', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    const component = fixture.componentInstance as any;
    expect(component.statusTone('INACTIVE')).toBe('neutral');
  });

  it('statusLabel returns a string for ACTIVE', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    const component = fixture.componentInstance as any;
    expect(typeof component.statusLabel('ACTIVE')).toBe('string');
  });

  // ── Toggle status ──────────────────────────────────────────────────────────

  it('toggleStatus dispatches setStatus with INACTIVE when confirmed for ACTIVE partner', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    vi.spyOn(component['confirm'], 'confirm').mockResolvedValue(true);

    const partner = {
      id: 'p-1',
      name: 'Dr. Ramesh',
      status: 'ACTIVE' as const,
      partnerId: 'P001',
      partnerTypeName: 'Doctor',
      referralCode: 'REF001',
      mobile: '',
      email: '',
      passwordState: 'OK',
      createdAt: '',
      updatedAt: '',
    };
    await component.toggleStatus(partner);

    expect(dispatchSpy).toHaveBeenCalledWith(
      PartnerActions.setStatus({ id: 'p-1', status: 'INACTIVE' }),
    );
  }, 20000);

  it('toggleStatus dispatches setStatus with ACTIVE when confirmed for INACTIVE partner', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    vi.spyOn(component['confirm'], 'confirm').mockResolvedValue(true);

    const partner = {
      id: 'p-2',
      name: 'Dr. Sita',
      status: 'INACTIVE' as const,
      partnerId: 'P002',
      partnerTypeName: 'Doctor',
      referralCode: 'REF002',
      mobile: '',
      email: '',
      passwordState: 'OK',
      createdAt: '',
      updatedAt: '',
    };
    await component.toggleStatus(partner);

    expect(dispatchSpy).toHaveBeenCalledWith(
      PartnerActions.setStatus({ id: 'p-2', status: 'ACTIVE' }),
    );
  }, 20000);

  it('toggleStatus does NOT dispatch when confirmation is cancelled', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    vi.spyOn(component['confirm'], 'confirm').mockResolvedValue(false);

    const partner = {
      id: 'p-1',
      name: 'Dr. Ramesh',
      status: 'ACTIVE' as const,
      partnerId: 'P001',
      partnerTypeName: 'Doctor',
      referralCode: 'REF001',
      mobile: '',
      email: '',
      passwordState: 'OK',
      createdAt: '',
      updatedAt: '',
    };
    await component.toggleStatus(partner);

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: PartnerActions.setStatus.type }),
    );
  }, 20000);

  // ── rowId ──────────────────────────────────────────────────────────────────

  it('rowId returns the partner id', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerListComponent);
    const component = fixture.componentInstance as any;
    const partner = {
      id: 'p-99',
      name: '',
      partnerId: '',
      partnerTypeName: '',
      status: 'ACTIVE',
      referralCode: '',
      mobile: '',
      email: '',
      passwordState: 'OK',
      createdAt: '',
      updatedAt: '',
    };
    expect(component.rowId(partner)).toBe('p-99');
  });
});
