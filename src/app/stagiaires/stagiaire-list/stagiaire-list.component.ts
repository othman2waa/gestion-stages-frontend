import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { StagiaireService } from '../../core/services/stagiaire.service';
import { StagiaireFormComponent } from '../stagiaire-form/stagiaire-form.component';

@Component({
  selector: 'app-stagiaire-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatCardModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './stagiaire-list.component.html',
  styleUrls: ['./stagiaire-list.component.scss']
})
export class StagiaireListComponent implements OnInit {
  stagiaires: any[] = [];
  filteredStagiaires: any[] = [];
  searchKeyword = '';
  isLoading = true;
  displayedColumns = ['nom', 'email', 'cin', 'filiere', 'niveau', 'etablissement', 'actions'];

  constructor(
    private stagiaireService: StagiaireService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStagiaires();
  }

  loadStagiaires(): void {
    this.isLoading = true;
    this.stagiaireService.getAll().subscribe({
      next: (data) => {
        this.stagiaires = data;
        this.filteredStagiaires = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void {
    if (this.searchKeyword.trim()) {
      this.stagiaireService.search(this.searchKeyword).subscribe(
        data => this.filteredStagiaires = data
      );
    } else {
      this.filteredStagiaires = this.stagiaires;
    }
  }

  openForm(stagiaire?: any): void {
    const dialogRef = this.dialog.open(StagiaireFormComponent, {
      width: '600px',
      data: stagiaire || null
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadStagiaires();
    });
  }

  delete(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.stagiaireService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Stagiaire supprimé', 'Fermer', { duration: 3000 });
          this.loadStagiaires();
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    }
  }
}