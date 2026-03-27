import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'candidature',  // ← PAS de canActivate ici
    loadComponent: () => import('./candidature-publique/candidature-publique.component')
      .then(m => m.CandidaturePubliqueComponent)
  },
  {
    path: 'stagiaire',
    canActivate: [authGuard],
    loadChildren: () => import('./stagiaire-portal/stagiaire-portal.module').then(m => m.StagiairePortalModule)
  },
  {
  path: 'offres',
  loadComponent: () => import('./annonces-publiques/annonces-publiques.component')
    .then(m => m.AnnoncesPubliquesComponent)
},
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  { path: '**', redirectTo: 'auth/login' }
];