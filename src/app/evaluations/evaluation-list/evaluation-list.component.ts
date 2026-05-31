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

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressBarModule, MatChipsModule, MatSelectModule
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
  selectedEvaluation: any = null;
  userRole = '';

  readonly types = ['FIN_STAGE', 'MI_PARCOURS'];

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
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userRole = currentUser.role ?? '';
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
    this.filteredEvaluations = result;
  }

  onSearch(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  resetFiltres(): void {
    this.searchKeyword = ''; this.selectedType = '';
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
          next: () => { this.snackBar.open('Évaluation supprimée', 'Fermer', { duration: 3000 }); this.loadEvaluations(); }
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

  exportExcel(): void { this.exportService.exportEvaluations(this.evaluations); }
  exportPdf(): void { this.exportService.exportEvaluationsPdf(this.evaluations); }
}