import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { Withdrawal, WithdrawalAction, WithdrawalPolicy } from '../models/withdrawal.model';

export const WithdrawalActions = createActionGroup({
  source: 'Admin Withdrawals',
  events: {
    'Load Detail': props<{ id: Id }>(),
    'Load Detail Success': props<{ withdrawal: Withdrawal }>(),
    'Load Detail Failure': props<{ error: ApiError }>(),
    'Detail Cleared': emptyProps(),

    'Load Policy': emptyProps(),
    'Load Policy Success': props<{ policy: WithdrawalPolicy }>(),
    'Load Policy Failure': props<{ error: ApiError }>(),

    Approve: props<{ id: Id }>(),
    Reject: props<{ id: Id; reason: string }>(),
    'Mark Processing': props<{ id: Id }>(),
    'Mark Paid': props<{ id: Id; paymentReference: string }>(),
    'Mark Failed': props<{ id: Id; reason: string }>(),

    'Action Success': props<{ withdrawal: Withdrawal; action: WithdrawalAction }>(),
    'Action Failure': props<{ error: ApiError }>(),
    'Action Error Cleared': emptyProps(),
  },
});
