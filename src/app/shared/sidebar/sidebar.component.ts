import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subscription, filter } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

interface MenuGroup {
  title: string;
  roles: string[];
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;

  badges: Record<string, number> = {};
  userRole = '';
  currentUrl = '';
  private routerSub!: Subscription;

  readonly menuGroups: MenuGroup[] = [
    {
      title: 'Principal',
      roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT'],
      items: [
        { label:'Dashboard',    icon:'dashboard',          route:'/dashboard',           roles:['ADMIN_RH','RESPONSABLE_RH'] },
        { label:'Mon Espace',   icon:'dashboard_customize',route:'/encadrant-dashboard', roles:['ENCADRANT'] },
      ]
    },
    {
      title: 'Recrutement',
      roles: ['ADMIN_RH', 'RESPONSABLE_RH'],
      items: [
        { label:'Annonces',     icon:'campaign',           route:'/annonces',            roles:['ADMIN_RH','RESPONSABLE_RH'] },
        { label:'Candidatures', icon:'inbox',              route:'/candidatures',        roles:['ADMIN_RH','RESPONSABLE_RH'] },
        { label:'Sujets',       icon:'assignment',         route:'/sujets',              roles:['ADMIN_RH','RESPONSABLE_RH'] },
      ]
    },
    {
      title: 'Gestion',
      roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT'],
      items: [
        { label:'Stagiaires',   icon:'school',             route:'/stagiaires',          roles:['ADMIN_RH','RESPONSABLE_RH','ENCADRANT'] },
        { label:'Stages',       icon:'work',               route:'/stages',              roles:['ADMIN_RH','RESPONSABLE_RH','ENCADRANT'] },
        { label:'Encadrants',   icon:'supervisor_account', route:'/encadrants',          roles:['ADMIN_RH','RESPONSABLE_RH'] },
        { label:'Départements', icon:'business',           route:'/departements',        roles:['ADMIN_RH','RESPONSABLE_RH'] },
      ]
    },
    {
      title: 'Suivi',
      roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT'],
      items: [
        { label:'Conventions',  icon:'description',        route:'/conventions',         roles:['ADMIN_RH','RESPONSABLE_RH'] },
        { label:'Suivi hebdo',  icon:'event_note',         route:'/suivi-hebdomadaire',  roles:['ADMIN_RH','RESPONSABLE_RH','ENCADRANT'] },
        { label:'Évaluations',  icon:'star_rate',          route:'/evaluations',         roles:['ADMIN_RH','RESPONSABLE_RH','ENCADRANT'] },
        { label:'Onboarding',   icon:'checklist',          route:'/onboarding',          roles:['ADMIN_RH','RESPONSABLE_RH'] },
      ]
    },
    {
      title: 'Administration',
      roles: ['ADMIN_RH', 'RESPONSABLE_RH'],
      items: [
        { label:'Attestations', icon:'workspace_premium',  route:'/attestations',        roles:['ADMIN_RH','RESPONSABLE_RH'] },
        { label:'Comptes',      icon:'manage_accounts',    route:'/gestion-comptes',     roles:['ADMIN_RH'] },
        { label:'Reporting',    icon:'bar_chart',          route:'/reporting',           roles:['ADMIN_RH','RESPONSABLE_RH'] },
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    private http: HttpClient
  ) {
    this.currentUrl = this.router.url;
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    this.loadBadges();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  loadBadges(): void {
    if (!['ADMIN_RH','RESPONSABLE_RH'].includes(this.userRole)) return;
    this.http.get<any>('http://localhost:8080/api/reporting/stats-completes').subscribe({
      next: (stats) => {
        this.badges['/candidatures'] = stats.candidaturesEnAttente ?? 0;
        this.badges['/attestations'] = stats.attestationsEnAttente ?? 0;
        this.badges['/evaluations']  = stats.stagesEnAttenteEvaluation ?? 0;
      },
      error: () => {}
    });
  }

  get filteredGroups(): MenuGroup[] {
    return this.menuGroups
      .filter(g => g.roles.includes(this.userRole))
      .map(g => ({
        ...g,
        items: g.items.filter(i => i.roles.includes(this.userRole))
      }))
      .filter(g => g.items.length > 0);
  }

  getBadge(route: string): number {
    return this.badges[route] ?? 0;
  }

  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInfo(): { name: string; role: string; initials: string } {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const name = user.username ?? 'Utilisateur';
    const role = this.userRole.replace('_', ' ');
    const initials = name.substring(0, 2).toUpperCase();
    return { name, role, initials };
  }
}