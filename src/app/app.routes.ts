import { ResolveStart, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Roles } from './types/roles';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome').then((m) => m.WelcomePage),
  },
  {
    path: 'tutor',
    loadComponent: () => import('./pages/tutor/tutor').then((m) => m.TutorPage),
    canActivate: [authGuard],
    data: {roles: [Roles.STUDENT, Roles.ADMIN, Roles.TEACHER]}
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.SettingsPage),
    canActivate: [authGuard],
    data: {roles: [Roles.STUDENT, Roles.ADMIN, Roles.TEACHER]}
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help').then((m) => m.HelpPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminPage),
    canActivate: [authGuard],
    data: {roles: [Roles.ADMIN]}
  },
  {
    path: '**',
    redirectTo: '',
  },
];
