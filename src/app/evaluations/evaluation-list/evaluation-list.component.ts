import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { EvaluationService } from '../../core/services/evaluation.service';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressBarModule, MatChipsModule, MatSelectModule,
    BaseChartDirective
  ],
  templateUrl: './evaluation-list.component.html',
  styleUrls: ['./evaluation-list.component.scss']
})
export class EvaluationListComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  evaluations: any[] = [];
  filteredEvaluations: any[] = [];
  isLoading = true;
  searchKeyword = '';
  selectedType = '';
  selectedNiveau = '';
  selectedEvaluation: any = null;
  userRole = '';

  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }
  get isStagiaire(): boolean { return this.userRole === 'STAGIAIRE'; }
  get isAdmin(): boolean { return ['ADMIN_RH', 'RESPONSABLE_RH'].includes(this.userRole); }

  get moyenneGenerale(): number {
    if (!this.evaluations.length) return 0;
    return this.evaluations.reduce((s, e) => s + (e.note ?? 0), 0) / this.evaluations.length;
  }
  get nombreExcellent(): number { return this.evaluations.filter(e => e.note >= 16).length; }
  get nombreBien(): number { return this.evaluations.filter(e => e.note >= 12 && e.note < 16).length; }
  get nombreInsuffisant(): number { return this.evaluations.filter(e => e.note < 10).length; }

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.isLoading = true;
    const obs = this.isStagiaire
      ? this.evaluationService.getMesEvaluations()
      : this.isEncadrant
        ? this.evaluationService.getMesEvaluationsEncadrant()
        : this.evaluationService.getAll();
    obs.subscribe({
      next: (data) => { this.evaluations = data; this.applyFilters(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    let result = this.evaluations;
    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase();
      result = result.filter(e =>
        e.stageSujet?.toLowerCase().includes(kw) ||
        e.encadrantNom?.toLowerCase().includes(kw) ||
        e.stagiaireNom?.toLowerCase().includes(kw)
      );
    }
    if (this.selectedType) {
      result = result.filter(e => e.typeEvaluation === this.selectedType);
    }
    if (this.selectedNiveau) {
      result = result.filter(e => {
        const n = e.note ?? 0;
        switch (this.selectedNiveau) {
          case 'excellent': return n >= 16;
          case 'bien': return n >= 12 && n < 16;
          case 'passable': return n >= 10 && n < 12;
          case 'insuffisant': return n < 10;
          default: return true;
        }
      });
    }
    this.filteredEvaluations = result;
  }

  onSearch(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  resetFiltres(): void {
    this.searchKeyword = ''; this.selectedType = ''; this.selectedNiveau = '';
    this.filteredEvaluations = this.evaluations;
  }

  voirDetail(e: any): void {
    this.selectedEvaluation = e;
    this.dialog.open(this.detailDialog, { width: '520px' });
  }

  openForm(evaluation?: any): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: '650px', data: evaluation || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadEvaluations(); });
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Confirmer la suppression ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.evaluationService.delete(id).subscribe({
          next: () => { this.snackBar.open('Évaluation supprimée', 'Fermer', { duration: 3000 }); this.loadEvaluations(); },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
        });
      }
    });
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'note-excellent';
    if (note >= 12) return 'note-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
  }

  getNoteLabel(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getTypeLabel(type: string): string {
    if (type === 'FIN_STAGE') return 'Fin de stage';
    if (type === 'MI_PARCOURS') return 'Mi-parcours';
    return type?.replace('_', ' ') ?? '—';
  }

  exportExcel(): void { this.exportService.exportEvaluations(this.evaluations); }
  exportPdf(): void { this.exportService.exportEvaluationsPdf(this.evaluations); }

  trackById(_: number, item: any): number { return item.id; }

  // ── Charts ──

  get distributionChartData(): ChartData<'doughnut'> {
    return {
      labels: ['Excellent (≥16)', 'Bien (12-15)', 'Passable (10-11)', 'Insuffisant (<10)'],
      datasets: [{
        data: [
          this.evaluations.filter(e => e.note >= 16).length,
          this.evaluations.filter(e => e.note >= 12 && e.note < 16).length,
          this.evaluations.filter(e => e.note >= 10 && e.note < 12).length,
          this.evaluations.filter(e => e.note < 10).length
        ],
        backgroundColor: ['#00843D', '#1E40AF', '#F59E0B', '#DC2626'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  distributionChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '60%',
    plugins: { legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }
  };

  get timelineChartData(): ChartData<'line'> {
    const sorted = [...this.evaluations]
      .filter(e => e.dateEval)
      .sort((a, b) => new Date(a.dateEval).getTime() - new Date(b.dateEval).getTime());
    const labels = sorted.map(e => {
      const d = new Date(e.dateEval);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });
    const data = sorted.map(e => e.note);
    return {
      labels,
      datasets: [{
        label: 'Note /20',
        data,
        borderColor: '#00843D',
        backgroundColor: 'rgba(0,132,61,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: data.map(n => n >= 16 ? '#00843D' : n >= 12 ? '#1E40AF' : n >= 10 ? '#F59E0B' : '#DC2626'),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }]
    };
  }

  timelineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { min: 0, max: 20, ticks: { stepSize: 4, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };
}
