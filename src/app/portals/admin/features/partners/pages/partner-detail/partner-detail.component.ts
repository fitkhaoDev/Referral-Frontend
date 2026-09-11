import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { PartnerTypeOptionsService } from '../../data-access/partner-type-options.service';
import {
  CreatePartnerPayload,
  PARTNER_PASSWORD_STATE_LABEL,
  PARTNER_STATUS_LABEL,
  UpdatePartnerPayload,
} from '../../models/partner.model';
import { PartnerActions } from '../../store/partners.actions';
import { PartnersFacade } from '../../store/partners.facade';

@Component({
  selector: 'app-partner-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-detail.component.html',
  styleUrl: './partner-detail.component.css',
})
export class PartnerDetailComponent implements OnDestroy {
  protected readonly facade = inject(PartnersFacade);
  private readonly confirm = inject(ConfirmService);
  private readonly actions$ = inject(Actions);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly typeOptions = toSignal(inject(PartnerTypeOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly partner = this.facade.detail;
  protected readonly loading = this.facade.detailLoading;
  protected readonly loadError = this.facade.detailLoadError;
  protected readonly saving = this.facade.saving;
  protected readonly saveError = this.facade.saveError;
  protected readonly resetResult = this.facade.resetResult;
  protected readonly editing = signal(false);

  protected readonly statusLabel = PARTNER_STATUS_LABEL;
  protected readonly passwordStateLabel = PARTNER_PASSWORD_STATE_LABEL;

  constructor() {
    this.facade.clearResetResult();

    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });

    this.actions$
      .pipe(ofType(PartnerActions.updateSuccess), takeUntilDestroyed())
      .subscribe(() => this.editing.set(false));
  }

  ngOnDestroy(): void {
    this.facade.clearDetail();
  }

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected onSave(payload: CreatePartnerPayload | UpdatePartnerPayload): void {
    this.facade.update(this.id(), payload as UpdatePartnerPayload);
  }

  protected async toggleStatus(): Promise<void> {
    const p = this.partner();
    if (!p) return;
    const deactivating = p.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate ${p.name}?` : `Reactivate ${p.name}?`,
      message: deactivating
        ? 'They will not be able to sign in. All historical referral, commission, wallet and withdrawal data is retained.'
        : 'They will be able to sign in to the partner portal again.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) this.facade.setStatus(p.id, deactivating ? 'INACTIVE' : 'ACTIVE');
  }

  protected async resetPassword(): Promise<void> {
    const p = this.partner();
    if (!p) return;
    const ok = await this.confirm.confirm({
      title: `Reset password for ${p.name}?`,
      message:
        'A new temporary password is generated. The partner must change it on next sign in. Their current password is never shown to anyone.',
      confirmLabel: 'Reset password',
      tone: 'danger',
    });
    if (ok) this.facade.resetPassword(p.id);
  }

  protected dismissResetResult(): void {
    this.facade.clearResetResult();
  }
}
