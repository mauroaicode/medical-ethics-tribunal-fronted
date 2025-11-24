import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/sign-in',
  },
  {
    path: 'sign-in',
    canActivate: [guestGuard],
    loadChildren: () => import('./modules/auth/sign-in/sign-in.routes'),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./modules/auth/forgot-password/forgot-password.routes'),
  },

  // Admin routes (protected - only for authenticated users)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/layouts/authenticated/authenticated.component').then(
        (m) => m.AuthenticatedLayoutComponent
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/admin/admin.routes').then((m) => m.default),
      },
    ],
  },
  { path: '**', redirectTo: '/sign-in' },
];
