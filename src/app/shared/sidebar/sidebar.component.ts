import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT', 'STAGIAIRE'] },
    { label: 'Stagiaires', icon: 'school', route: '/stagiaires', roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT'] },
    { label: 'Stages', icon: 'work', route: '/stages', roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT', 'STAGIAIRE'] },
    { label: 'Encadrants', icon: 'supervisor_account', route: '/encadrants', roles: ['ADMIN_RH', 'RESPONSABLE_RH'] },
    { label: 'Conventions', icon: 'description', route: '/conventions', roles: ['ADMIN_RH', 'RESPONSABLE_RH'] },
    { label: 'Évaluations', icon: 'star_rate', route: '/evaluations', roles: ['ADMIN_RH', 'RESPONSABLE_RH', 'ENCADRANT'] },
    { label: 'Reporting', icon: 'bar_chart', route: '/reporting', roles: ['ADMIN_RH', 'RESPONSABLE_RH'] },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get filteredMenuItems(): MenuItem[] {
    const role = this.authService.getRole();
    return this.menuItems.filter(item => item.roles.includes(role ?? ''));
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }
}