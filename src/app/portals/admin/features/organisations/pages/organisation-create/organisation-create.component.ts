import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationTypeOptionsService } from '../../data-access/organisation-type-options.service';
import { CreateOrganisationPayload, UpdateOrganisationPayload } from '../../models/organisation.model';
import { OrganisationsFacade } from '../../store/organisations.facade';

@Component({
  selector: 'app-organisation-create',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-create.component.html',
  styleUrl: './organisation-create.component.css',
})
export class OrganisationCreateComponent {
  private readonly facade = inject(OrganisationsFacade);
  private readonly router = inject(Router);

  protected readonly typeOptions = toSignal(inject(OrganisationTypeOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });
  protected readonly saving = this.facade.saving;
  protected readonly saveError = this.facade.saveError;

  protected onSave(payload: CreateOrganisationPayload | UpdateOrganisationPayload): void {
    this.facade.create(payload as CreateOrganisationPayload);
  }

  protected onCancel(): void {
    void this.router.navigate(['/admin/organisations']);
  }
}
