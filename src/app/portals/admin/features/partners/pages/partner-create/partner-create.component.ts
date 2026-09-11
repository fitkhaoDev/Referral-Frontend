import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { PartnerTypeOptionsService } from '../../data-access/partner-type-options.service';
import { CreatePartnerPayload, UpdatePartnerPayload } from '../../models/partner.model';
import { PartnersFacade } from '../../store/partners.facade';

@Component({
  selector: 'app-partner-create',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-create.component.html',
  styleUrl: './partner-create.component.css',
})
export class PartnerCreateComponent {
  private readonly facade = inject(PartnersFacade);
  private readonly router = inject(Router);

  protected readonly typeOptions = toSignal(inject(PartnerTypeOptionsService).options$, {
    initialValue: [] as SelectOption[],
  });
  protected readonly saving = this.facade.saving;
  protected readonly saveError = this.facade.saveError;

  protected onSave(payload: CreatePartnerPayload | UpdatePartnerPayload): void {
    this.facade.create(payload as CreatePartnerPayload);
  }

  protected onCancel(): void {
    void this.router.navigate(['/admin/partners']);
  }
}
