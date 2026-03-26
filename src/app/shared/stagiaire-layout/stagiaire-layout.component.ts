import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { StagiaireDashboardService } from '../../core/services/stagiaire-dashboard.service';

@Component({
  selector: 'app-stagiaire-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatTooltipModule
  ],
  templateUrl: './stagiaire-layout.component.html',
  styleUrls: ['./stagiaire-layout.component.scss']
})
export class StagiaireLayoutComponent implements OnInit {
  stagiaire: any = null;
  currentRoute = '';

  navItems = [
    { label: 'Accueil', icon: 'home', route: '/stagiaire/accueil' },
    { label: 'Mes Évaluations', icon: 'star', route: '/stagiaire/evaluations' },
  ];

  constructor(
    private authService: AuthService,
    private dashService: StagiaireDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.dashService.getMonDashboard().subscribe({
      next: (data) => this.stagiaire = data,
      error: () => {}
    });
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  getInitials(): string {
    if (!this.stagiaire) return '?';
    return `${this.stagiaire.stagiairePrenom?.charAt(0) ?? ''}${this.stagiaire.stagiaireNom?.charAt(0) ?? ''}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}