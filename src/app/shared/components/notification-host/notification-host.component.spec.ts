import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/notifications/notification.service';
import { NotificationHostComponent } from './notification-host.component';

describe('NotificationHostComponent', () => {
  let service: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationHostComponent],
      providers: [NotificationService],
    }).compileComponents();
    service = TestBed.inject(NotificationService);
  });

  it('renders a toast for each active notification', () => {
    const fixture = TestBed.createComponent(NotificationHostComponent);
    service.error('Boom');
    fixture.detectChanges();
    const toast = fixture.nativeElement.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast.getAttribute('role')).toBe('alert');
  });
});
