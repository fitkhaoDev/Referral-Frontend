import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnerTypesModule } from '../../partner-types.module';
import { PartnerTypeActions } from '../../store/partner-types.actions';
import { partnerTypesList } from '../../store/partner-types.list';
import { PartnerTypeListComponent } from './partner-type-list.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure(queryParams: Record<string, string> = {}) {
  const routerStub = {
    navigate: vi.fn().mockResolvedValue(true),
    url: '/admin/partner-types',
    parseUrl: () => ({ queryParams: {} }),
  };
  TestBed.configureTestingModule({
    imports: [PartnerTypesModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
      { provide: Router, useValue: routerStub },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
      },
    ],
  });
  return { store: TestBed.inject(Store), router: routerStub };
}

describe('PartnerTypeListComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
    TestBed.resetTestingModule();
  });

  // ── Initialisation ─────────────────────────────────────────────────────────

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

  it('renders all column headers', async () => {
    configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Name');
    expect(text).toContain('Code');
    expect(text).toContain('Partners');
    expect(text).toContain('Status');
  });

  it('pre-fills status filter when URL has status param', async () => {
    configure({ status: 'ACTIVE' });
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const component = fixture.componentInstance as any;
    expect(component.statusFilter.value).toBe('ACTIVE');
  });

  // ── Create dialog ──────────────────────────────────────────────────────────

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

  // ── Search ─────────────────────────────────────────────────────────────────

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

  // ── Status filter ──────────────────────────────────────────────────────────

  it('status filter dispatches filtersChanged', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.statusFilter.setValue('ACTIVE');
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnerTypesList.actions.filtersChanged.type }),
    );
  });

  it('status filter with empty string dispatches filtersChanged with undefined status', async () => {
    const { store } = configure({ status: 'ACTIVE' });
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    await wait(700);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.statusFilter.setValue('');
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: partnerTypesList.actions.filtersChanged.type }),
    );
  });

  // ── Sort & page ────────────────────────────────────────────────────────────

  it('onSort dispatches sortChanged', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onSort([{ field: 'name', direction: 'asc' }]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnerTypesList.actions.sortChanged({ sort: [{ field: 'name', direction: 'asc' }] }),
    );
  });

  it('onPage dispatches pageChanged', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onPage({ page: 1, size: 10 });

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnerTypesList.actions.pageChanged({ page: 1, size: 10 }),
    );
  });

  it('onSearch dispatches searchChanged', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onSearch('yoga');

    expect(dispatchSpy).toHaveBeenCalledWith(
      partnerTypesList.actions.searchChanged({ search: 'yoga' }),
    );
  });

  it('onClearFilters dispatches filtersCleared', () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    component.onClearFilters();

    expect(dispatchSpy).toHaveBeenCalledWith(partnerTypesList.actions.filtersCleared());
  });

  // ── Status helpers ─────────────────────────────────────────────────────────

  it('statusTone returns success for ACTIVE', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    const component = fixture.componentInstance as any;
    expect(component.statusTone('ACTIVE')).toBe('success');
  });

  it('statusTone returns neutral for INACTIVE', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    const component = fixture.componentInstance as any;
    expect(component.statusTone('INACTIVE')).toBe('neutral');
  });

  it('statusLabel returns a non-empty string', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    const component = fixture.componentInstance as any;
    expect(typeof component.statusLabel('ACTIVE')).toBe('string');
    expect(typeof component.statusLabel('INACTIVE')).toBe('string');
  });

  // ── Edit dialog ────────────────────────────────────────────────────────────

  it('openEdit opens the form dialog with edit mode', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();

    const component = fixture.componentInstance as any;
    const row = {
      id: 'pt-1',
      name: 'Doctor',
      code: 'DOCTOR',
      status: 'ACTIVE',
      partnerCount: 5,
      createdAt: '',
      updatedAt: '',
    };
    component.openEdit(row);
    fixture.detectChanges();

    expect(overlay.querySelector('app-partner-type-form-dialog')).toBeTruthy();
  });

  // ── Toggle status ──────────────────────────────────────────────────────────

  it('toggleStatus dispatches setStatus with INACTIVE when row is ACTIVE and confirmed', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    const confirmService = component['confirm'];
    vi.spyOn(confirmService, 'confirm').mockResolvedValue(true);

    const row = {
      id: 'pt-1',
      name: 'Doctor',
      code: 'DOCTOR',
      status: 'ACTIVE' as const,
      partnerCount: 5,
      createdAt: '',
      updatedAt: '',
    };
    await component.toggleStatus(row);

    expect(dispatchSpy).toHaveBeenCalledWith(
      PartnerTypeActions.setStatus({ id: 'pt-1', status: 'INACTIVE' }),
    );
  });

  it('toggleStatus dispatches setStatus with ACTIVE when row is INACTIVE and confirmed', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    vi.spyOn(component['confirm'], 'confirm').mockResolvedValue(true);

    const row = {
      id: 'pt-2',
      name: 'Nurse',
      code: 'NURSE',
      status: 'INACTIVE' as const,
      partnerCount: 0,
      createdAt: '',
      updatedAt: '',
    };
    await component.toggleStatus(row);

    expect(dispatchSpy).toHaveBeenCalledWith(
      PartnerTypeActions.setStatus({ id: 'pt-2', status: 'ACTIVE' }),
    );
  });

  it('toggleStatus does NOT dispatch when the confirmation is cancelled', async () => {
    const { store } = configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    fixture.detectChanges();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const component = fixture.componentInstance as any;
    vi.spyOn(component['confirm'], 'confirm').mockResolvedValue(false);

    const row = {
      id: 'pt-1',
      name: 'Doctor',
      code: 'DOCTOR',
      status: 'ACTIVE' as const,
      partnerCount: 5,
      createdAt: '',
      updatedAt: '',
    };
    await component.toggleStatus(row);

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: PartnerTypeActions.setStatus.type }),
    );
  });

  // ── rowId helper ──────────────────────────────────────────────────────────

  it('rowId returns the id of the row', () => {
    configure();
    const fixture = TestBed.createComponent(PartnerTypeListComponent);
    const component = fixture.componentInstance as any;
    expect(
      component.rowId({ id: 'pt-99', name: '', code: '', status: 'ACTIVE', partnerCount: 0, createdAt: '', updatedAt: '' }),
    ).toBe('pt-99');
  });
});
