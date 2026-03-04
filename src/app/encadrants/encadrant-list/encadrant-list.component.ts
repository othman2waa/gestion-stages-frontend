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
import { EncadrantService } from '../../core/services/encadrant.service';
import { EncadrantFormComponent } from '../encadrant-form/encadrant-form.component';

@Component({
  selector: 'app-encadrant-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './encadrant-list.component.html',
  styleUrls: ['./encadrant-list.component.scss']
})
export class EncadrantListComponent implements OnInit {
  encadrants: any[] = [];
  isLoading = true;
  displayedColumns = ['nom', 'email', 'fonction', 'departement', 'actions'];

  constructor(
    private encadrantService: EncadrantService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadEncadrants(); }

  loadEncadrants(): void {
    this.isLoading = true;
    this.encadrantService.getAll().subscribe({
      next: (data) => { this.encadrants = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm(encadrant?: any): void {
    const dialogRef = this.dialog.open(EncadrantFormComponent, {
      width: '600px', data: encadrant || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadEncadrants(); });
  }

  delete(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.encadrantService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Encadrant supprimé', 'Fermer', { duration: 3000 });
          this.loadEncadrants();
        }
      });
    }
  }
}