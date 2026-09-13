import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { PartnerTypeApi } from '../data-access/partner-type-api.abstract';
import { PartnerType } from '../models/partner-type.model';
import { PartnerTypeActions } from './partner-types.actions';
import { PartnerTypesEffects } from './partner-types.effects';
import { partnerTypesList } from './partner-types.list';

const mockType: PartnerType = {
  id: 'pt-1',
  name: 'Doctor',
  code: 'DOCTOR',
  status: 'ACTIVE',
  partnerCount: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockError: ApiError = {
  status: 409,
  code: 'CODE_TAKEN',
  message: 'Code already in use.',
};

describe('PartnerTypesEffects', () => {
  let effects: PartnerTypesEffects;
  let actions$: Observable<Action>;
  let apiSpy: { list: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; setStatus: ReturnType<typeof vi.fn> };
  let notifSpy: { success: ReturnType<typeof vi.fn>; fromApiError: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiSpy = {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      setStatus: vi.fn(),
    };

    notifSpy = {
      success: vi.fn(),
      fromApiError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PartnerTypesEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            [partnerTypesList.name]: partnerTypesList.initialState,
          },
        }),
        { provide: PartnerTypeApi, useValue: apiSpy },
        { provide: NotificationService, useValue: notifSpy },
      ],
    });

    effects = TestBed.inject(PartnerTypesEffects);
  });

  // ── create$ ───────────────────────────────────────────────────────────────────

  describe('create$', () => {
    it('dispatches createSuccess when the API call succeeds', async () => {
      apiSpy.create.mockReturnValue(of(mockType));
      actions$ = of(PartnerTypeActions.create({ payload: { name: 'Doctor', code: 'DOCTOR', status: 'ACTIVE' } }));
      const action = await firstValueFrom(effects.create$);
      expect(action).toEqual(PartnerTypeActions.createSuccess({ partnerType: mockType }));
    });

    it('dispatches createFailure when the API call throws', async () => {
      apiSpy.create.mockReturnValue(throwError(() => mockError));
      actions$ = of(PartnerTypeActions.create({ payload: { name: 'X', code: 'X', status: 'ACTIVE' } }));
      const action = await firstValueFrom(effects.create$);
      expect(action).toEqual(PartnerTypeActions.createFailure({ error: mockError }));
    });

    it('wraps unknown errors in a generic ApiError on failure', async () => {
      apiSpy.create.mockReturnValue(throwError(() => new Error('network down')));
      actions$ = of(PartnerTypeActions.create({ payload: { name: 'X', code: 'X', status: 'ACTIVE' } }));
      const action = await firstValueFrom(effects.create$) as any;
      expect(action.type).toBe(PartnerTypeActions.createFailure.type);
      expect(action.error.status).toBe(0);
    });
  });

  // ── update$ ───────────────────────────────────────────────────────────────────

  describe('update$', () => {
    it('dispatches updateSuccess on API success', async () => {
      apiSpy.update.mockReturnValue(of(mockType));
      actions$ = of(PartnerTypeActions.update({ id: 'pt-1', payload: { name: 'Updated', status: 'ACTIVE' } }));
      const action = await firstValueFrom(effects.update$);
      expect(action).toEqual(PartnerTypeActions.updateSuccess({ partnerType: mockType }));
    });

    it('dispatches updateFailure on API error', async () => {
      apiSpy.update.mockReturnValue(throwError(() => mockError));
      actions$ = of(PartnerTypeActions.update({ id: 'pt-1', payload: { name: 'X', status: 'ACTIVE' } }));
      const action = await firstValueFrom(effects.update$);
      expect(action).toEqual(PartnerTypeActions.updateFailure({ error: mockError }));
    });
  });

  // ── setStatus$ ────────────────────────────────────────────────────────────────

  describe('setStatus$', () => {
    it('dispatches setStatusSuccess on API success', async () => {
      const inactive = { ...mockType, status: 'INACTIVE' as const };
      apiSpy.setStatus.mockReturnValue(of(inactive));
      actions$ = of(PartnerTypeActions.setStatus({ id: 'pt-1', status: 'INACTIVE' }));
      const action = await firstValueFrom(effects.setStatus$);
      expect(action).toEqual(PartnerTypeActions.setStatusSuccess({ partnerType: inactive }));
    });

    it('dispatches setStatusFailure on API error', async () => {
      apiSpy.setStatus.mockReturnValue(throwError(() => mockError));
      actions$ = of(PartnerTypeActions.setStatus({ id: 'pt-1', status: 'INACTIVE' }));
      const action = await firstValueFrom(effects.setStatus$);
      expect(action).toEqual(PartnerTypeActions.setStatusFailure({ error: mockError }));
    });
  });

  // ── reloadAfterMutation$ ──────────────────────────────────────────────────────

  describe('reloadAfterMutation$', () => {
    it('dispatches reload after createSuccess', async () => {
      actions$ = of(PartnerTypeActions.createSuccess({ partnerType: mockType }));
      const action = await firstValueFrom(effects.reloadAfterMutation$);
      expect(action.type).toBe(partnerTypesList.actions.reload.type);
    });

    it('dispatches reload after updateSuccess', async () => {
      actions$ = of(PartnerTypeActions.updateSuccess({ partnerType: mockType }));
      const action = await firstValueFrom(effects.reloadAfterMutation$);
      expect(action.type).toBe(partnerTypesList.actions.reload.type);
    });

    it('dispatches reload after setStatusSuccess', async () => {
      actions$ = of(PartnerTypeActions.setStatusSuccess({ partnerType: mockType }));
      const action = await firstValueFrom(effects.reloadAfterMutation$);
      expect(action.type).toBe(partnerTypesList.actions.reload.type);
    });
  });

  // ── toast$ ────────────────────────────────────────────────────────────────────

  describe('toast$', () => {
    it('shows a success notification on createSuccess', async () => {
      actions$ = of(PartnerTypeActions.createSuccess({ partnerType: mockType }));
      await firstValueFrom(effects.toast$);
      expect(notifSpy.success).toHaveBeenCalledWith(`Partner type "${mockType.name}" created`);
    });

    it('shows a success notification on updateSuccess', async () => {
      actions$ = of(PartnerTypeActions.updateSuccess({ partnerType: mockType }));
      await firstValueFrom(effects.toast$);
      expect(notifSpy.success).toHaveBeenCalledWith(`Partner type "${mockType.name}" updated`);
    });

    it('shows an active notification on setStatusSuccess (ACTIVE)', async () => {
      actions$ = of(PartnerTypeActions.setStatusSuccess({ partnerType: { ...mockType, status: 'ACTIVE' } }));
      await firstValueFrom(effects.toast$);
      expect(notifSpy.success).toHaveBeenCalledWith(expect.stringContaining('active'));
    });

    it('shows an inactive notification on setStatusSuccess (INACTIVE)', async () => {
      actions$ = of(PartnerTypeActions.setStatusSuccess({ partnerType: { ...mockType, status: 'INACTIVE' } }));
      await firstValueFrom(effects.toast$);
      expect(notifSpy.success).toHaveBeenCalledWith(expect.stringContaining('inactive'));
    });

    it('calls fromApiError on setStatusFailure', async () => {
      actions$ = of(PartnerTypeActions.setStatusFailure({ error: mockError }));
      await firstValueFrom(effects.toast$);
      expect(notifSpy.fromApiError).toHaveBeenCalledWith(mockError);
    });
  });
});
