import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { StagiaireDashboardService } from '../core/services/stagiaire-dashboard.service';
import { ConventionService } from '../core/services/convention.service';

@Component({
  selector: 'app-stagiaire-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule, MatSnackBarModule
  ],
  templateUrl: './stagiaire-dashboard.component.html',
  styleUrls: ['./stagiaire-dashboard.component.scss']
})
export class StagiaireDashboardComponent implements OnInit {
  dashboard: any = null;
  isLoading = true;

  readonly steps = [
    { key: 'EN_ATTENTE',            label: 'Candidature' },
    { key: 'VALIDEE',               label: 'Validé' },
    { key: 'CONVENTION_GENEREE',    label: 'Convention' },
    { key: 'CONVENTION_SIGNEE',     label: 'Signée' },
    { key: 'EN_COURS',              label: 'En cours' },
    { key: 'EN_ATTENTE_EVALUATION', label: 'Évaluation' },
    { key: 'TERMINE',               label: 'Terminé' },
  ];

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
    private dashService: StagiaireDashboardService,
    private conventionService: ConventionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dashService.getMonDashboard().subscribe({
      next: (data) => { this.dashboard = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(statut: string): string {
    return this.statutColors[statut] ?? 'status-gray';
  }

  isStepDone(stepKey: string): boolean {
    const order = this.steps.map(s => s.key);
    const current = order.indexOf(this.dashboard?.stageStatut);
    const step = order.indexOf(stepKey);
    return step <= current;
  }

  isStepActive(stepKey: string): boolean {
    return this.dashboard?.stageStatut === stepKey;
  }

  telechargerConvention(): void {
    if (!this.dashboard?.conventionId) return;
    this.conventionService.getPdf(this.dashboard.conventionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `convention-${this.dashboard.conventionNumero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erreur téléchargement PDF', 'Fermer', { duration: 3000 })
    });
  }
}