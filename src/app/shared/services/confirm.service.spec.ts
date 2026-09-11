import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared.module';
import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;
  let overlayContainer: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedModule] });
    service = TestBed.inject(ConfirmService);
    overlayContainer = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => {
    overlayContainer.remove();
  });

  it('resolves true when the confirm button is clicked', async () => {
    const promise = service.confirm({ title: 'Deactivate?', message: 'Are you sure?', tone: 'danger' });
    await Promise.resolve();

    const buttons = overlayContainer.querySelectorAll('app-button button');
    expect(buttons.length).toBe(2);
    (buttons[1] as HTMLButtonElement).click();

    await expect(promise).resolves.toBe(true);
  });

  it('resolves false when cancelled', async () => {
    const promise = service.confirm({ title: 'Deactivate?', message: 'Are you sure?' });
    await Promise.resolve();

    const buttons = overlayContainer.querySelectorAll('app-button button');
    (buttons[0] as HTMLButtonElement).click();

    await expect(promise).resolves.toBe(false);
  });
});
