import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../components/dialog/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from '../components/dialog/confirm-dialog/confirm-dialog.model';

/** Opens a modal confirmation and resolves `true` only if the user confirms. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(Dialog);

  async confirm(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data,
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
      disableClose: false,
    });
    const result = await firstValueFrom(ref.closed);
    return result === true;
  }
}
