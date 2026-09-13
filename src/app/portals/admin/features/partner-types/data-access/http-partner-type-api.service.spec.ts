import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { HttpPartnerTypeApiService } from './http-partner-type-api.service';
import { PartnerTypeApi } from './partner-type-api.abstract';
import { partnerTypeApiProvider } from './partner-type-api.provider';

const API_BASE = 'http://api.test/adm/partner-types';

const mockPage = {
  items: [{ id: 'pt-1', name: 'Doctor', code: 'DOCTOR', status: 'ACTIVE', partnerCount: 5, createdAt: '', updatedAt: '' }],
  page: 0,
  size: 10,
  totalItems: 1,
  totalPages: 1,
};

describe('HttpPartnerTypeApiService', () => {
  let service: HttpPartnerTypeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl: 'http://api.test' } },
        partnerTypeApiProvider,
      ],
    });
    service = TestBed.inject(PartnerTypeApi) as HttpPartnerTypeApiService;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── list() ────────────────────────────────────────────────────────────────────

  describe('list()', () => {
    it('includes page and size for normal page queries', () => {
      service.list({ page: 2, size: 10 }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({ data: mockPage });
    });

    it('omits page and size when size === Number.MAX_SAFE_INTEGER (fetch-all mode)', () => {
      service.list({ page: 0, size: Number.MAX_SAFE_INTEGER, filters: { status: 'ACTIVE' } }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('size')).toBe(false);
      req.flush({ data: mockPage });
    });

    it('includes search param when provided', () => {
      service.list({ page: 0, size: 10, search: 'doctor' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.get('search')).toBe('doctor');
      req.flush({ data: mockPage });
    });

    it('omits search param when empty', () => {
      service.list({ page: 0, size: 10, search: '' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.has('search')).toBe(false);
      req.flush({ data: mockPage });
    });

    it('appends sort param as field,direction', () => {
      service.list({ page: 0, size: 10, sort: [{ field: 'name', direction: 'asc' }] }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.getAll('sort')).toEqual(['name,asc']);
      req.flush({ data: mockPage });
    });

    it('appends multiple sort params', () => {
      service.list({
        page: 0, size: 10,
        sort: [{ field: 'name', direction: 'asc' }, { field: 'createdAt', direction: 'desc' }],
      }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.getAll('sort')).toEqual(['name,asc', 'createdAt,desc']);
      req.flush({ data: mockPage });
    });

    it('includes status filter param', () => {
      service.list({ page: 0, size: 10, filters: { status: 'ACTIVE' } }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.get('status')).toBe('ACTIVE');
      req.flush({ data: mockPage });
    });

    it('omits null or empty-string filter values', () => {
      service.list({ page: 0, size: 10, filters: { status: null, partnerTypeId: '' } }).subscribe();
      const req = httpMock.expectOne((r) => r.url === API_BASE);
      expect(req.request.params.has('status')).toBe(false);
      expect(req.request.params.has('partnerTypeId')).toBe(false);
      req.flush({ data: mockPage });
    });

    it('maps the response data correctly', async () => {
      const req$ = service.list({ page: 0, size: 10 });
      const promise = firstValueFrom(req$);
      httpMock.expectOne((r) => r.url === API_BASE).flush({ data: mockPage });
      expect(await promise).toEqual(mockPage);
    });
  });

  // ── get() ─────────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('sends GET to /adm/partner-types/{id}', () => {
      service.get('pt-1').subscribe();
      const req = httpMock.expectOne(`${API_BASE}/pt-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: {} });
    });

    it('maps the data field of the response', async () => {
      const item = { id: 'pt-1', name: 'Doctor', code: 'DOCTOR', status: 'ACTIVE', partnerCount: 5, createdAt: '', updatedAt: '' };
      const promise = firstValueFrom(service.get('pt-1'));
      httpMock.expectOne(`${API_BASE}/pt-1`).flush({ data: item });
      expect(await promise).toEqual(item);
    });
  });

  // ── create() ──────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('sends POST to /adm/partner-types with the payload', () => {
      const payload = { name: 'New', code: 'NEW', status: 'ACTIVE' as const };
      service.create(payload).subscribe();
      const req = httpMock.expectOne(API_BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: { id: '1', ...payload, partnerCount: 0, createdAt: '', updatedAt: '' } });
    });

    it('returns the created partner type from data field', async () => {
      const payload = { name: 'New', code: 'NEW', status: 'ACTIVE' as const };
      const created = { id: '1', ...payload, partnerCount: 0, createdAt: '', updatedAt: '' };
      const promise = firstValueFrom(service.create(payload));
      httpMock.expectOne(API_BASE).flush({ data: created });
      expect(await promise).toEqual(created);
    });
  });

  // ── update() ──────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('sends PUT to /adm/partner-types/{id}', () => {
      const payload = { name: 'Updated', status: 'ACTIVE' as const };
      service.update('pt-1', payload).subscribe();
      const req = httpMock.expectOne(`${API_BASE}/pt-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ data: {} });
    });
  });

  // ── setStatus() ───────────────────────────────────────────────────────────────

  describe('setStatus()', () => {
    it('sends PATCH to /adm/partner-types/{id}/status', () => {
      service.setStatus('pt-1', 'INACTIVE').subscribe();
      const req = httpMock.expectOne(`${API_BASE}/pt-1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'INACTIVE' });
      req.flush({ data: {} });
    });

    it('sends PATCH with ACTIVE to reactivate', () => {
      service.setStatus('pt-2', 'ACTIVE').subscribe();
      const req = httpMock.expectOne(`${API_BASE}/pt-2/status`);
      expect(req.request.body).toEqual({ status: 'ACTIVE' });
      req.flush({ data: {} });
    });
  });
});
