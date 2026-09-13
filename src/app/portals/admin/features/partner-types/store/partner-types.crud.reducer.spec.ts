import { ApiError } from '@core/models/api.model';
import { PartnerType } from '../models/partner-type.model';
import { PartnerTypeActions } from './partner-types.actions';
import { partnerTypesCrudReducer, PartnerTypesCrudState } from './partner-types.crud.reducer';

const INITIAL: PartnerTypesCrudState = { saving: false, error: null };

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
  fieldErrors: { code: ['This code is already taken.'] },
};

const createPayload = { name: 'Test', code: 'TEST', status: 'ACTIVE' as const };
const updatePayload = { name: 'Updated', status: 'ACTIVE' as const };

describe('partnerTypesCrudReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = partnerTypesCrudReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(INITIAL);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('on create', () => {
    it('sets saving=true and clears any prior error', () => {
      const state = partnerTypesCrudReducer(
        { saving: false, error: mockError },
        PartnerTypeActions.create({ payload: createPayload }),
      );
      expect(state.saving).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('on createSuccess', () => {
    it('resets to initial state', () => {
      const state = partnerTypesCrudReducer(
        { saving: true, error: null },
        PartnerTypeActions.createSuccess({ partnerType: mockType }),
      );
      expect(state).toEqual(INITIAL);
    });
  });

  describe('on createFailure', () => {
    it('sets saving=false and stores the error', () => {
      const state = partnerTypesCrudReducer(
        { saving: true, error: null },
        PartnerTypeActions.createFailure({ error: mockError }),
      );
      expect(state.saving).toBe(false);
      expect(state.error).toEqual(mockError);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('on update', () => {
    it('sets saving=true and clears error', () => {
      const state = partnerTypesCrudReducer(
        { saving: false, error: mockError },
        PartnerTypeActions.update({ id: 'pt-1', payload: updatePayload }),
      );
      expect(state.saving).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('on updateSuccess', () => {
    it('resets to initial state', () => {
      const state = partnerTypesCrudReducer(
        { saving: true, error: null },
        PartnerTypeActions.updateSuccess({ partnerType: mockType }),
      );
      expect(state).toEqual(INITIAL);
    });
  });

  describe('on updateFailure', () => {
    it('sets saving=false and stores the error', () => {
      const state = partnerTypesCrudReducer(
        { saving: true, error: null },
        PartnerTypeActions.updateFailure({ error: mockError }),
      );
      expect(state.saving).toBe(false);
      expect(state.error).toEqual(mockError);
    });
  });

  // ── setStatus ────────────────────────────────────────────────────────────────

  describe('on setStatus', () => {
    it('sets saving=true and clears error', () => {
      const state = partnerTypesCrudReducer(
        { saving: false, error: mockError },
        PartnerTypeActions.setStatus({ id: 'pt-1', status: 'INACTIVE' }),
      );
      expect(state.saving).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('on setStatusSuccess', () => {
    it('resets to initial state', () => {
      const state = partnerTypesCrudReducer(
        { saving: true, error: null },
        PartnerTypeActions.setStatusSuccess({ partnerType: mockType }),
      );
      expect(state).toEqual(INITIAL);
    });
  });

  describe('on setStatusFailure', () => {
    it('sets saving=false and stores the error', () => {
      const state = partnerTypesCrudReducer(
        { saving: true, error: null },
        PartnerTypeActions.setStatusFailure({ error: mockError }),
      );
      expect(state.saving).toBe(false);
      expect(state.error).toEqual(mockError);
    });
  });

  // ── cross-cutting ─────────────────────────────────────────────────────────────

  it('clears a previous error when a new mutation starts', () => {
    const state = partnerTypesCrudReducer(
      { saving: false, error: mockError },
      PartnerTypeActions.update({ id: 'pt-1', payload: updatePayload }),
    );
    expect(state.error).toBeNull();
  });

  it('overwrites a previous error with the new one on successive failures', () => {
    const newError: ApiError = { status: 500, code: 'SERVER', message: 'Server failed.' };
    const state = partnerTypesCrudReducer(
      { saving: true, error: mockError },
      PartnerTypeActions.updateFailure({ error: newError }),
    );
    expect(state.error).toEqual(newError);
  });

  it('does not mutate the input state', () => {
    const input: PartnerTypesCrudState = { saving: false, error: null };
    partnerTypesCrudReducer(input, PartnerTypeActions.create({ payload: createPayload }));
    expect(input.saving).toBe(false);
  });
});
