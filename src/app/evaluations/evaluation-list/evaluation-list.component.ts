import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationService } from '../../core/services/evaluation.service';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule, MatChipsModule
  ],
  templateUrl: './evaluation-list.component.html',
  styleUrls: ['./evaluation-list.component.scss']
})
export class EvaluationListComponent implements OnInit {
  evaluations: any[] = [];
  isLoading = true;
  displayedColumns = ['stage', 'encadrant', 'note', 'type', 'dateEval', 'actions'];
  userRole = '';

  constructor(
    private evaluationService: EvaluationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userRole = currentUser.role ?? '';
    this.loadEvaluations();
  }

  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }
  get isStagiaire(): boolean { return this.userRole === 'STAGIAIRE'; }
  get isAdmin(): boolean { return ['ADMIN_RH', 'RESPONSABLE_RH'].includes(this.userRole); }

  loadEvaluations(): void {
    this.isLoading = true;
    const obs = this.isStagiaire
      ? this.evaluationService.getMesEvaluations()
      : this.isEncadrant
        ? this.evaluationService.getMesEvaluationsEncadrant()
        : this.evaluationService.getAll();

    obs.subscribe({
      next: (data) => { this.evaluations = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm(evaluation?: any): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: '650px', data: evaluation || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadEvaluations(); });
  }

  delete(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.evaluationService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Évaluation supprimée', 'Fermer', { duration: 3000 });
          this.loadEvaluations();
        }
      });
    }
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'note-excellent';
    if (note >= 12) return 'note-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
  }
}