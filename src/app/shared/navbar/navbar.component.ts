import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface Breadcrumb { label: string; icon: string; }

const ROUTE_LABELS: Record<string, Breadcrumb> = {
  dashboard:              { label: 'Tableau de bord',       icon: 'dashboard' },
  stagiaires:             { label: 'Stagiaires',            icon: 'school' },
  stages:                 { label: 'Stages',                icon: 'work' },
  encadrants:             { label: 'Encadrants',            icon: 'supervisor_account' },
  conventions:            { label: 'Convocations',           icon: 'description' },
  evaluations:            { label: 'Évaluations',           icon: 'star_rate' },
  onboarding:             { label: 'Onboarding',            icon: 'how_to_reg' },
  'suivi-hebdomadaire':   { label: 'Suivi Hebdomadaire',    icon: 'event_note' },
  'encadrant-dashboard':  { label: 'Espace Encadrant',      icon: 'person' },
  'stagiaire-dashboard':  { label: 'Espace Stagiaire',      icon: 'school' },
  'gestion-comptes':      { label: 'Gestion Comptes',       icon: 'manage_accounts' },
  'rapport-stage':        { label: 'Rapport de Stage',      icon: 'article' },
  candidatures:           { label: 'Candidatures',          icon: 'assignment_ind' },
  annonces:               { label: 'Annonces',              icon: 'campaign' },
  departements:           { label: 'Départements',          icon: 'business' },
  attestations:           { label: 'Attestations',          icon: 'verified' },
  sujets:                 { label: 'Sujets de Stage',       icon: 'assignment' },
  'candidatures-encadrant':{ label: 'Candidatures',         icon: 'assignment_ind' },
  archives:               { label: 'Archives',              icon: 'archive' },
  reporting:              { label: 'Reporting',             icon: 'bar_chart' },
  notifications:          { label: 'Notifications',         icon: 'notifications' },
  'fiches-appreciation':  { label: 'Fiches d\'Appréciation', icon: 'rate_review' },
};

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  breadcrumb: Breadcrumb | null = null;
  private routerSub!: Subscription;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumb(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => this.updateBreadcrumb(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateBreadcrumb(url: string): void {
    const segments = url.split('/').filter(Boolean);
    const key = segments[segments.length - 1] ?? 'dashboard';
    this.breadcrumb = ROUTE_LABELS[key] ?? null;
  }
}