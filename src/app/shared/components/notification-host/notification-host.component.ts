import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '@core/notifications/notification.service';

/** Renders active toasts in an accessible live region. Mounted once per portal shell. */
@Component({
  selector: 'app-notification-host',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-host.component.html',
  styleUrl: './notification-host.component.css',
})
export class NotificationHostComponent {
  protected readonly service = inject(NotificationService);

  protected icon(tone: string): string {
    return { success: '✓', error: '!', warning: '△', info: 'i' }[tone] ?? 'i';
  }
}
