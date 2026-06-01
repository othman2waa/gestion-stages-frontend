import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription, filter, interval } from 'rxjs';

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
  private pollSub!: Subscription;

  // Notifications
  notifOpen = false;
  notifications: AppNotification[] = [];
  unreadCount = 0;

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
  roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT'],
  items: [
    { label:'Annonces',     icon:'campaign',  route:'/annonces',               roles:['ADMIN_RH','RESPONSABLE_RH'] },
    { label:'Candidatures', icon:'inbox',     route:'/candidatures',           roles:['ADMIN_RH','RESPONSABLE_RH'] },
    { label:'Sujets',       icon:'assignment',route:'/sujets',                 roles:['ADMIN_RH','RESPONSABLE_RH'] },
    { label:'Candidatures', icon:'inbox',     route:'/candidatures-encadrant', roles:['ENCADRANT'] },
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
        { label: 'Archives', icon: 'archive', route: '/archives', roles: ['ADMIN_RH', 'RESPONSABLE_RH'] },
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    private http: HttpClient,
    private notifService: NotificationService
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
    this.loadNotifications();
    // Poll notifications every 60 seconds
    this.pollSub = interval(60000).subscribe(() => this.loadNotifications());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  // ── Notifications ──

  loadNotifications(): void {
    this.notifService.refreshCount();
    this.notifService.unreadCount.subscribe(c => this.unreadCount = c);
  }

  toggleNotif(event: Event): void {
    event.stopPropagation();
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) {
      this.notifService.getAll().subscribe(n => this.notifications = n.slice(0, 20));
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-dropdown') && !target.closest('.notif-bell')) {
      this.notifOpen = false;
    }
  }

  markAsRead(notif: AppNotification): void {
    if (!notif.lue) {
      this.notifService.marquerLue(notif.id).subscribe();
      notif.lue = true;
    }
    if (notif.lien) this.router.navigate([notif.lien]);
    this.notifOpen = false;
  }

  markAllRead(): void {
    this.notifService.marquerToutesLues().subscribe(() => {
      this.notifications.forEach(n => n.lue = true);
    });
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      STAGE: 'work', CANDIDATURE: 'inbox', CONVENTION: 'description',
      EVALUATION: 'star_rate', ATTESTATION: 'workspace_premium', SYSTEME: 'info'
    };
    return icons[type] ?? 'notifications';
  }

  getNotifColor(type: string): string {
    const colors: Record<string, string> = {
      STAGE: '#00843D', CANDIDATURE: '#1E40AF', CONVENTION: '#7C3AED',
      EVALUATION: '#F47920', ATTESTATION: '#0891B2', SYSTEME: '#64748B'
    };
    return colors[type] ?? '#64748B';
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return Math.floor(diff / 86400) + ' j';
    return date.toLocaleDateString('fr-FR');
  }

  loadBadges(): void {
    if (!['ADMIN_RH','RESPONSABLE_RH'].includes(this.userRole)) return;
    this.http.get<any>(`${environment.apiUrl}/reporting/stats-completes`).subscribe({
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
    const user = this.authService.getCurrentUser();
    const name = user?.username ?? 'Utilisateur';
    const role = this.userRole.replace('_', ' ');
    const initials = name.substring(0, 2).toUpperCase();
    return { name, role, initials };
  }
}