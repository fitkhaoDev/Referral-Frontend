import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { catchError, of, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrganisationMemberApi } from '../../../organisation-members/data-access/organisation-member-api.abstract';
import { OrganisationTypeOptionsService } from '../../data-access/organisation-type-options.service';
import {
  CreateOrganisationPayload,
  UpdateOrganisationPayload,
} from '../../models/organisation.model';
import { OrganisationActions } from '../../store/organisations.actions';
import { OrganisationsFacade } from '../../store/organisations.facade';

@Component({
  selector: 'app-organisation-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css',
})
export class OrganisationDetailComponent implements OnDestroy {
  protected readonly facade = inject(OrganisationsFacade);
  private readonly confirm = inject(ConfirmService);
  private readonly actions$ = inject(Actions);
  private readonly memberApi = inject(OrganisationMemberApi);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly typeOptions = toSignal(inject(OrganisationTypeOptionsService).options$, {
    initialValue: [],
  });

  protected readonly organisation = this.facade.detail;
  protected readonly loading = this.facade.detailLoading;
  protected readonly loadError = this.facade.detailLoadError;
  protected readonly saving = this.facade.saving;
  protected readonly saveError = this.facade.saveError;
  protected readonly resetResult = this.facade.resetResult;
  protected readonly editing = signal(false);

  protected passwordStateLabel(state: 'MUST_CHANGE' | 'OK'): string {
    return state === 'MUST_CHANGE' ? 'Must change password' : 'Password set';
  }

  /** First few members, for a preview on the detail page. Full CRUD is on the members screen. */
  protected readonly memberPreview = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        id
          ? this.memberApi
              .list({
                page: 0,
                size: 6,
                sort: [{ field: 'name', direction: 'asc' }],
                search: '',
                filters: { organisationId: id },
              })
              .pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  protected readonly manageMembersLink = computed(() => ['/admin/organisation-members']);
  protected readonly manageMembersQuery = computed(() => ({ organisationId: this.id() }));

  constructor() {
    this.facade.clearResetResult();

    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });

    this.actions$
      .pipe(ofType(OrganisationActions.updateSuccess), takeUntilDestroyed())
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

  protected onSave(payload: CreateOrganisationPayload | UpdateOrganisationPayload): void {
    this.facade.update(this.id(), payload as UpdateOrganisationPayload);
  }

  protected async toggleStatus(): Promise<void> {
    const o = this.organisation();
    if (!o) return;
    const deactivating = o.status === 'ACTIVE';
    const ok = await this.confirm.confirm({
      title: deactivating ? `Deactivate ${o.name}?` : `Reactivate ${o.name}?`,
      message: deactivating
        ? 'The organisation cannot sign in and its referral code cannot be used for new attributions. All history is retained.'
        : 'The organisation can sign in again and its referral code becomes usable.',
      confirmLabel: deactivating ? 'Deactivate' : 'Reactivate',
      tone: deactivating ? 'danger' : 'primary',
    });
    if (ok) this.facade.setStatus(o.id, deactivating ? 'INACTIVE' : 'ACTIVE');
  }

  protected async resetPassword(): Promise<void> {
    const o = this.organisation();
    if (!o) return;
    const ok = await this.confirm.confirm({
      title: `Reset password for ${o.name}?`,
      message:
        'A new temporary password is generated. The organisation must change it on next sign in. The existing password is never shown to anyone.',
      confirmLabel: 'Reset password',
      tone: 'danger',
    });
    if (ok) this.facade.resetPassword(o.id);
  }

  protected dismissResetResult(): void {
    this.facade.clearResetResult();
  }
}
