import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';

/**
 * Root routing. The two portals are lazy-loaded as separate NgModules and never
 * share a module boundary. Unauthenticated visitors default to the partner login
 * (partners are the mobile-primary audience); admins go to `/admin`.
 */
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'partner/login' },
  {
    path: 'admin',
    loadChildren: () => import('./portals/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'partner',
    loadChildren: () => import('./portals/partner/partner.module').then((m) => m.PartnerModule),
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      bindToComponentInputs: true,
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
