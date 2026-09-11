import { Withdrawal, WithdrawalAction } from '../../models/withdrawal.model';

export interface WithdrawalActionDialogData {
  readonly withdrawal: Withdrawal;
  readonly action: WithdrawalAction;
}
