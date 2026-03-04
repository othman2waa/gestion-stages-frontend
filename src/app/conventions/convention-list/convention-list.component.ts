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
import { ConventionService } from '../../core/services/convention.service';
import { ConventionFormComponent } from '../convention-form/convention-form.component';

@Component({
  selector: 'app-convention-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './convention-list.component.html',
  styleUrls: ['./convention-list.component.scss']
})
export class ConventionListComponent implements OnInit {
  conventions: any[] = [];
  isLoading = true;
  displayedColumns = ['numero', 'stage', 'statut', 'dateEmission', 'actions'];

  constructor(
    private conventionService: ConventionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadConventions(); }

  loadConventions(): void {
    this.isLoading = true;
    this.conventionService.getAll().subscribe({
      next: (data) => { this.conventions = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm(convention?: any): void {
    const dialogRef = this.dialog.open(ConventionFormComponent, {
      width: '600px', data: convention || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadConventions(); });
  }

  delete(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.conventionService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Convention supprimée', 'Fermer', { duration: 3000 });
          this.loadConventions();
        }
      });
    }
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'BROUILLON': 'gray', 'SOUMISE': 'orange',
      'APPROUVEE': 'blue', 'SIGNEE': 'green', 'REJETEE': 'red'
    };
    return colors[statut] ?? 'gray';
  }
}