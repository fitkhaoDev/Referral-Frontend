import { TestBed } from '@angular/core/testing';
import { ApiError } from '../models/api.model';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds and auto-dismisses a success toast', () => {
    service.success('Saved');
    expect(service.notifications().length).toBe(1);
    vi.advanceTimersByTime(4000);
    expect(service.notifications().length).toBe(0);
  });

  it('keeps error toasts until dismissed', () => {
    const id = service.error('Failed');
    vi.advanceTimersByTime(60_000);
    expect(service.notifications().length).toBe(1);
    service.dismiss(id);
    expect(service.notifications().length).toBe(0);
  });

  it('suppresses toasts for 422 validation errors', () => {
    const err: ApiError = { status: 422, code: 'VALIDATION', message: 'Bad', fieldErrors: { name: ['x'] } };
    expect(service.fromApiError(err)).toBeNull();
    expect(service.notifications().length).toBe(0);
  });

  it('shows a toast for non-field errors and includes the correlation id', () => {
    const err: ApiError = { status: 500, code: 'X', message: 'Server error', correlationId: 'abc-123' };
    service.fromApiError(err);
    const toast = service.notifications()[0];
    expect(toast.tone).toBe('error');
    expect(toast.detail).toContain('abc-123');
  });
});
