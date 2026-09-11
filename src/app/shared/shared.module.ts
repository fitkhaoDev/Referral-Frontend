import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AlertComponent } from './components/alert/alert.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { ButtonComponent } from './components/button/button.component';
import { ColumnCellDirective } from './components/data-table/column-cell.directive';
import { DataTableComponent } from './components/data-table/data-table.component';
import { ConfirmDialogComponent } from './components/dialog/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from './components/dialog/dialog-shell/dialog-shell.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { DateFieldComponent } from './components/form-fields/date-field/date-field.component';
import { SelectFieldComponent } from './components/form-fields/select-field/select-field.component';
import { SwitchFieldComponent } from './components/form-fields/switch-field/switch-field.component';
import { TextFieldComponent } from './components/form-fields/text-field/text-field.component';
import { LogoComponent } from './components/logo/logo.component';
import { NotificationHostComponent } from './components/notification-host/notification-host.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PlaceholderComponent } from './pages/placeholder/placeholder.component';
import { MoneyPipe } from './pipes/money.pipe';

const DECLARATIONS = [
  AlertComponent,
  AuthLayoutComponent,
  ButtonComponent,
  ColumnCellDirective,
  DataTableComponent,
  ConfirmDialogComponent,
  DateFieldComponent,
  DialogShellComponent,
  EmptyStateComponent,
  FilterBarComponent,
  LogoComponent,
  NotificationHostComponent,
  PageHeaderComponent,
  PaginationComponent,
  SelectFieldComponent,
  StatusBadgeComponent,
  SwitchFieldComponent,
  TextFieldComponent,
  MoneyPipe,
  ForbiddenComponent,
  NotFoundComponent,
  PlaceholderComponent,
];

/**
 * Shared presentational building blocks + re-exported Angular / CDK modules.
 * Imported by every feature module; never provides singletons (those live in
 * {@link CoreModule}).
 */
@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, DialogModule],
  declarations: DECLARATIONS,
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ...DECLARATIONS,
  ],
})
export class SharedModule {}
