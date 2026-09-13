import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { PartnerTypeApi } from '../../partner-types/data-access/partner-type-api.abstract';
import { PartnerTypeOptionsService } from './partner-type-options.service';

const mockPage = (items: { id: string; name: string }[]) => ({
  items: items.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.name.toUpperCase(),
    status: 'ACTIVE' as const,
    partnerCount: 0,
    createdAt: '',
    updatedAt: '',
  })),
  page: 0,
  size: Number.MAX_SAFE_INTEGER,
  totalItems: items.length,
  totalPages: 1,
});

describe('PartnerTypeOptionsService', () => {
  let apiSpy: { list: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiSpy = { list: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        PartnerTypeOptionsService,
        { provide: PartnerTypeApi, useValue: apiSpy },
      ],
    });
  });

  // ── options$ mapping ───────────────────────────────────────────────────────

  it('maps PartnerType items to { value: id, label: name } SelectOptions', async () => {
    apiSpy.list.mockReturnValue(
      of(mockPage([
        { id: 'pt-1', name: 'Doctor' },
        { id: 'pt-2', name: 'Nurse' },
      ])),
    );
    const service = TestBed.inject(PartnerTypeOptionsService);
    const options = await firstValueFrom(service.options$);
    expect(options).toEqual([
      { value: 'pt-1', label: 'Doctor' },
      { value: 'pt-2', label: 'Nurse' },
    ]);
  });

  it('returns an empty array when no items are returned', async () => {
    apiSpy.list.mockReturnValue(of(mockPage([])));
    const service = TestBed.inject(PartnerTypeOptionsService);
    const options = await firstValueFrom(service.options$);
    expect(options).toEqual([]);
  });

  // ── API call contract ──────────────────────────────────────────────────────

  it('calls list with size=MAX_SAFE_INTEGER (fetch-all mode)', () => {
    apiSpy.list.mockReturnValue(of(mockPage([])));
    const service = TestBed.inject(PartnerTypeOptionsService);
    void service.options$.subscribe();
    expect(apiSpy.list).toHaveBeenCalledWith(
      expect.objectContaining({ size: Number.MAX_SAFE_INTEGER }),
    );
  });

  it('calls list with status=ACTIVE filter', () => {
    apiSpy.list.mockReturnValue(of(mockPage([])));
    const service = TestBed.inject(PartnerTypeOptionsService);
    void service.options$.subscribe();
    expect(apiSpy.list).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.objectContaining({ status: 'ACTIVE' }) }),
    );
  });

  it('calls list with sort name ascending', () => {
    apiSpy.list.mockReturnValue(of(mockPage([])));
    const service = TestBed.inject(PartnerTypeOptionsService);
    void service.options$.subscribe();
    expect(apiSpy.list).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: expect.arrayContaining([{ field: 'name', direction: 'asc' }]),
      }),
    );
  });

  // ── shareReplay behaviour ──────────────────────────────────────────────────

  it('calls the API only once for multiple subscribers (shareReplay)', async () => {
    apiSpy.list.mockReturnValue(
      of(mockPage([{ id: 'pt-1', name: 'Doctor' }])),
    );
    const service = TestBed.inject(PartnerTypeOptionsService);

    await firstValueFrom(service.options$);
    await firstValueFrom(service.options$);
    await firstValueFrom(service.options$);

    expect(apiSpy.list).toHaveBeenCalledTimes(1);
  });

  it('two concurrent subscribers receive the same items', async () => {
    apiSpy.list.mockReturnValue(
      of(mockPage([
        { id: 'pt-1', name: 'Doctor' },
        { id: 'pt-2', name: 'Nurse' },
      ])),
    );
    const service = TestBed.inject(PartnerTypeOptionsService);
    const [a, b] = await Promise.all([
      firstValueFrom(service.options$),
      firstValueFrom(service.options$),
    ]);
    expect(a).toEqual(b);
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('preserves the order returned by the API', async () => {
    apiSpy.list.mockReturnValue(
      of(mockPage([
        { id: 'pt-3', name: 'Yoga Instructor' },
        { id: 'pt-1', name: 'Doctor' },
        { id: 'pt-2', name: 'Nurse' },
      ])),
    );
    const service = TestBed.inject(PartnerTypeOptionsService);
    const options = await firstValueFrom(service.options$);
    expect(options.map((o) => o.label)).toEqual(['Yoga Instructor', 'Doctor', 'Nurse']);
  });

  it('propagates errors from the API', async () => {
    apiSpy.list.mockReturnValue(throwError(() => ({ status: 500, code: 'SERVER_ERROR', message: 'Server failed.' })));
    const service = TestBed.inject(PartnerTypeOptionsService);
    await expect(firstValueFrom(service.options$)).rejects.toMatchObject({ status: 500 });
  });
});
