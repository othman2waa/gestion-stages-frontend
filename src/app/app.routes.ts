import { Routes } from '@angular/router';
import { PortailCandidatureComponent } from './portail-candidature/portail-candidature.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'candidature',
    loadComponent: () => import('./candidature-publique/candidature-publique.component')
      .then(m => m.CandidaturePubliqueComponent)
  },
 
  {
    path: 'offres',
    loadComponent: () => import('./annonces-publiques/annonces-publiques.component')
      .then(m => m.AnnoncesPubliquesComponent)
  },
  {
    path: 'stagiaire',
    canActivate: [authGuard],
    loadChildren: () => import('./stagiaire-portal/stagiaire-portal.module').then(m => m.StagiairePortalModule)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
   {
    path: 'postuler',
    component: PortailCandidatureComponent   
  },
  { path: '**', redirectTo: 'auth/login' },
];