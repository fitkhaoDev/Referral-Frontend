import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { WithdrawalApi } from '../../data-access/withdrawal-api.abstract';
import { WithdrawalsModule } from '../../withdrawals.module';
import { WithdrawalActions } from '../../store/withdrawals.actions';
import { WithdrawalDetailComponent } from './withdrawal-detail.component';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function configure() {
  TestBed.configureTestingModule({
    imports: [
      WithdrawalsModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
  });
  return { store: TestBed.inject(Store), api: TestBed.inject(WithdrawalApi) };
}

async function firstRequestedId(api: WithdrawalApi): Promise<string> {
  const page = await firstValueFrom(
    api.list({ page: 0, size: 100, sort: [], search: '', filters: { status: 'REQUESTED' } }),
  );
  return page.items[0].id;
}

describe('WithdrawalDetailComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().remove();
  }, 20000);

  it('loads the withdrawal and shows only the backend-permitted actions', async () => {
    const { store, api } = configure();
    const id = await firstRequestedId(api);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(WithdrawalDetailComponent);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(WithdrawalActions.loadDetail({ id }));

    await wait(900);
    fixture.detectChanges();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.actions app-button'),
    ).map((b) => (b as HTMLElement).textContent?.trim());
    expect(buttons).toEqual(['Approve', 'Reject']);
  }, 20000);

  it('opens the action dialog for a permitted action', async () => {
    const { api } = configure();
    const id = await firstRequestedId(api);
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const fixture = TestBed.createComponent(WithdrawalDetailComponent);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await wait(900);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('.actions app-button button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(overlay.querySelector('app-withdrawal-action-dialog')).toBeTruthy();
  }, 20000);
});
