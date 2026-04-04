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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EncadrantService } from '../core/services/encadrant.service';
import { SujetsEncadrantComponent } from '../sujets-encadrant/sujets-encadrant.component';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule,
    MatTabsModule, MatBadgeModule, MatDialogModule, MatSnackBarModule,SujetsEncadrantComponent 
  ],
  templateUrl: './encadrant-dashboard.component.html',
  styleUrls: ['./encadrant-dashboard.component.scss']
})
export class EncadrantDashboardComponent implements OnInit {
  profil: any = null;
  isLoading = true;
  selectedStagiaire: any = null;
  searchTerm = '';
  filterStatut = '';

  readonly statuts = ['EN_COURS', 'TERMINE', 'EN_ATTENTE_EVALUATION', 'CONVENTION_SIGNEE'];

  readonly statutConfig: Record<string, { label: string; color: string; icon: string }> = {
    EN_ATTENTE:             { label:'En attente',      color:'#94A3B8', icon:'hourglass_empty' },
    VALIDEE:                { label:'Validée',          color:'#3B82F6', icon:'verified' },
    CONVENTION_GENEREE:     { label:'Convention générée',color:'#7C3AED',icon:'description' },
    CONVENTION_SIGNEE:      { label:'Convention signée', color:'#0891B2', icon:'draw' },
    EN_COURS:               { label:'En cours',         color:'#00843D', icon:'play_circle' },
    EN_ATTENTE_EVALUATION:  { label:'À évaluer',        color:'#F59E0B', icon:'star_rate' },
    FIN_STAGE:              { label:'Fin de stage',      color:'#F47920', icon:'flag' },
    TERMINE:                { label:'Terminé',           color:'#059669', icon:'check_circle' },
    ANNULE:                 { label:'Annulé',            color:'#DC2626', icon:'cancel' },
  };

  constructor(
    private encadrantService: EncadrantService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.encadrantService.getMonProfil().subscribe({
      next: (data) => { this.profil = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get filteredStagiaires(): any[] {
    return (this.profil?.stagiaires ?? []).filter((s: any) => {
      const matchSearch = !this.searchTerm ||
        `${s.stagiairePrenom} ${s.stagiaireNom} ${s.sujet}`.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchStatut = !this.filterStatut || s.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  get enCours(): number { return (this.profil?.stagiaires ?? []).filter((s:any) => s.statut === 'EN_COURS').length; }
  get aEvaluer(): number { return (this.profil?.stagiaires ?? []).filter((s:any) => s.statut === 'EN_ATTENTE_EVALUATION').length; }
  get termines(): number { return (this.profil?.stagiaires ?? []).filter((s:any) => s.statut === 'TERMINE').length; }

  getStatutConf(statut: string) { return this.statutConfig[statut] ?? { label: statut, color: '#94A3B8', icon: 'circle' }; }
  getInitials(nom: string, prenom: string): string { return `${prenom?.charAt(0) ?? ''}${nom?.charAt(0) ?? ''}`.toUpperCase(); }
  getProgressColor(p: number): string { return p >= 75 ? '#00843D' : p >= 40 ? '#F47920' : '#3B82F6'; }

  selectStagiaire(s: any): void {
    this.selectedStagiaire = this.selectedStagiaire?.stageId === s.stageId ? null : s;
  }

  allerAuSuivi(stageId?: number): void {
    this.router.navigate(['/suivi-hebdomadaire']);
  }

  allerAuxEvaluations(): void {
    this.router.navigate(['/evaluations']);
  }
}