import { TestBed } from '@angular/core/testing';
import { ApiError } from '../models/api.model';
import { NotificationService } from '../notifications/notification.service';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let notifications: { fromApiError: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    notifications = { fromApiError: vi.fn(), error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: NotificationService, useValue: notifications }],
    });
    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('routes a normalised ApiError to fromApiError', () => {
    const err: ApiError = { status: 409, code: 'CONFLICT', message: 'Nope' };
    handler.handleError(err);
    expect(notifications.fromApiError).toHaveBeenCalledWith(err);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('shows a generic message for unknown errors', () => {
    handler.handleError(new Error('boom'));
    expect(notifications.error).toHaveBeenCalled();
  });

  it('unwraps promise rejections', () => {
    const err: ApiError = { status: 0, code: 'NET', message: 'Offline' };
    handler.handleError({ rejection: err });
    expect(notifications.fromApiError).toHaveBeenCalledWith(err);
  });
});
