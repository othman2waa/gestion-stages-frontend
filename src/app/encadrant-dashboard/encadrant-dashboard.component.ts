import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { EncadrantService } from '../core/services/encadrant.service';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule,
    MatTabsModule, MatBadgeModule
  ],
  templateUrl: './encadrant-dashboard.component.html',
  styleUrls: ['./encadrant-dashboard.component.scss']
})
export class EncadrantDashboardComponent implements OnInit {
  profil: any = null;
  isLoading = true;
  selectedStagiaire: any = null;

  readonly statutColors: Record<string, string> = {
    EN_ATTENTE: 'status-gray',
    DEMANDE_SOUMISE: 'status-blue',
    EN_ATTENTE_VALIDATION: 'status-orange',
    VALIDEE: 'status-green',
    REJETEE: 'status-red',
    CONVENTION_GENEREE: 'status-purple',
    CONVENTION_SIGNEE: 'status-teal',
    EN_COURS: 'status-blue',
    EN_ATTENTE_EVALUATION: 'status-orange',
    TERMINE: 'status-green',
    ANNULE: 'status-red',
  };

  constructor(
    private encadrantService: EncadrantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.encadrantService.getMonProfil().subscribe({
      next: (data) => { this.profil = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  getStatutClass(statut: string): string {
    return this.statutColors[statut] ?? 'status-gray';
  }

  selectStagiaire(s: any): void {
    this.selectedStagiaire = this.selectedStagiaire?.stageId === s.stageId ? null : s;
  }

  allerAuSuivi(): void {
    this.router.navigate(['/suivi-hebdomadaire']);
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom?.charAt(0) ?? ''}${nom?.charAt(0) ?? ''}`.toUpperCase();
  }
}