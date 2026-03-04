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
import { EvaluationService } from '../../core/services/evaluation.service';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './evaluation-list.component.html',
  styleUrls: ['./evaluation-list.component.scss']
})
export class EvaluationListComponent implements OnInit {
  evaluations: any[] = [];
  isLoading = true;
  displayedColumns = ['stage', 'encadrant', 'note', 'type', 'dateEval', 'actions'];

  constructor(
    private evaluationService: EvaluationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadEvaluations(); }

  loadEvaluations(): void {
    this.isLoading = true;
    this.evaluationService.getAll().subscribe({
      next: (data) => { this.evaluations = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm(evaluation?: any): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: '600px', data: evaluation || null
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

  getNoteColor(note: number): string {
    if (note >= 14) return 'green';
    if (note >= 10) return 'orange';
    return 'red';
  }
}