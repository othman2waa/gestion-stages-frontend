import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { StageService } from '../../core/services/stage.service';
import { StageFormComponent } from '../stage-form/stage-form.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-stage-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatCardModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule,
    MatProgressSpinnerModule, MatChipsModule,RouterModule
  ],
  templateUrl: './stage-list.component.html',
  styleUrls: ['./stage-list.component.scss']
})
export class StageListComponent implements OnInit {
  stages: any[] = [];
  isLoading = true;
  displayedColumns = ['sujet', 'stagiaire', 'encadrant', 'type', 'statut', 'dates', 'actions'];

  constructor(
    private stageService: StageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadStages(); }

  loadStages(): void {
    this.isLoading = true;
    this.stageService.getAll().subscribe({
      next: (data) => { this.stages = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm(stage?: any): void {
    const dialogRef = this.dialog.open(StageFormComponent, {
      width: '650px', data: stage || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadStages(); });
  }

  updateStatut(id: number, statut: string): void {
    this.stageService.updateStatut(id, statut).subscribe({
      next: () => {
        this.snackBar.open('Statut mis à jour', 'Fermer', { duration: 3000 });
        this.loadStages();
      }
    });
  }

  delete(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.stageService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Stage supprimé', 'Fermer', { duration: 3000 });
          this.loadStages();
        }
      });
    }
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'EN_ATTENTE': 'orange', 'EN_COURS': 'green',
      'TERMINE': 'blue', 'ANNULE': 'red'
    };
    return colors[statut] ?? 'gray';
  }
}