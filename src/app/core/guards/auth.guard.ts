import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Routes accessibles par rôle
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN_RH: ['dashboard', 'stagiaires', 'stages', 'encadrants', 'conventions', 'evaluations',
    'onboarding', 'gestion-comptes', 'candidatures', 'annonces', 'departements',
    'attestations', 'sujets', 'archives', 'rapport-stage'],
  RESPONSABLE_RH: ['dashboard', 'stagiaires', 'stages', 'encadrants', 'conventions', 'evaluations',
    'onboarding', 'candidatures', 'annonces', 'departements', 'attestations', 'sujets', 'archives'],
  ENCADRANT: ['encadrant-dashboard', 'stages', 'evaluations', 'suivi-hebdomadaire', 'candidatures-encadrant'],
  STAGIAIRE: ['stagiaire-dashboard', 'suivi-hebdomadaire', 'rapport-stage']
};

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const role = authService.getRole();

  // Rediriger STAGIAIRE vers son portail
  if (role === 'STAGIAIRE' && !state.url.startsWith('/stagiaire')) {
    router.navigate(['/stagiaire']);
    return false;
  }

  // Pour les routes du dashboard layout, vérifier les permissions par rôle
  if (role && role !== 'STAGIAIRE') {
    const urlSegment = state.url.split('/').filter(s => s)[0] || 'dashboard';
    const allowedRoutes = ROLE_ROUTES[role] || [];

    if (!allowedRoutes.includes(urlSegment)) {
      const defaultRoute = role === 'ENCADRANT' ? '/encadrant-dashboard' : '/dashboard';
      router.navigate([defaultRoute]);
      return false;
    }
  }

  return true;
};