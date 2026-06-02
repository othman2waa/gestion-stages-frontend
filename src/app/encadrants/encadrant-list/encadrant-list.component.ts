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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EncadrantService } from '../../core/services/encadrant.service';
import { EncadrantFormComponent } from '../encadrant-form/encadrant-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { StageService } from '../../core/services/stage.service';

@Component({
  selector: 'app-encadrant-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressBarModule, MatChipsModule,
    MatSelectModule, MatFormFieldModule, MatPaginatorModule
  ],
  templateUrl: './encadrant-list.component.html',
  styleUrls: ['./encadrant-list.component.scss']
})
export class EncadrantListComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  encadrants: any[] = [];
  filteredEncadrants: any[] = [];
  stagesParEncadrant: Map<number, any[]> = new Map();
  isLoading = true;
  searchKeyword = '';
  selectedDepartement = '';
  selectedEncadrant: any = null;
  selectedEncadrantStages: any[] = [];

  // Pagination
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];

  constructor(
    private encadrantService: EncadrantService,
    private stageService: StageService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadEncadrants(); }

  loadEncadrants(): void {
    this.isLoading = true;
    this.encadrantService.getAll().subscribe({
      next: (data) => {
        this.encadrants = data;
        this.filteredEncadrants = data;
        this.isLoading = false;
        data.forEach((e: any) => this.loadStagesEncadrant(e.id));
      },
      error: () => this.isLoading = false
    });
  }

  loadStagesEncadrant(encadrantId: number): void {
    this.stageService.getByEncadrant(encadrantId).subscribe({
      next: (stages) => this.stagesParEncadrant.set(encadrantId, stages),
      error: () => this.stagesParEncadrant.set(encadrantId, [])
    });
  }

  get departements(): string[] {
    return [...new Set(this.encadrants.map(e => e.departementNom).filter(Boolean))].sort();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  applyFilters(): void {
    const kw = this.searchKeyword.toLowerCase();
    this.filteredEncadrants = this.encadrants.filter(e => {
      const matchSearch = !kw ||
        e.nom?.toLowerCase().includes(kw) ||
        e.prenom?.toLowerCase().includes(kw) ||
        e.email?.toLowerCase().includes(kw) ||
        e.fonction?.toLowerCase().includes(kw) ||
        e.departementNom?.toLowerCase().includes(kw);
      const matchDept = !this.selectedDepartement || e.departementNom === this.selectedDepartement;
      return matchSearch && matchDept;
    });
  }

  get paginatedEncadrants(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredEncadrants.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  resetFiltres(): void {
    this.searchKeyword = '';
    this.selectedDepartement = '';
    this.pageIndex = 0;
    this.filteredEncadrants = this.encadrants;
  }

  getNombreStagiaires(encadrantId: number): number {
    return this.stagesParEncadrant.get(encadrantId)?.length ?? 0;
  }

  getStagesEnCours(encadrantId: number): number {
    return this.stagesParEncadrant.get(encadrantId)
      ?.filter(s => s.statut === 'EN_COURS').length ?? 0;
  }

  voirDetail(e: any): void {
    this.selectedEncadrant = e;
    this.selectedEncadrantStages = this.stagesParEncadrant.get(e.id) ?? [];
    this.dialog.open(this.detailDialog, { width: '600px' });
  }

  openForm(encadrant?: any): void {
    const dialogRef = this.dialog.open(EncadrantFormComponent, {
      width: '600px', data: encadrant || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadEncadrants(); });
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Confirmer la suppression ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.encadrantService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Encadrant supprimé', 'Fermer', { duration: 3000 });
            this.loadEncadrants();
          }
        });
      }
    });
  }

  getInitials(e: any): string {
    return `${e.prenom?.charAt(0) ?? ''}${e.nom?.charAt(0) ?? ''}`.toUpperCase();
  }

  getStatutClass(statut: string): string {
    const map: any = {
      EN_COURS: 'status-blue', TERMINE: 'status-green',
      EN_ATTENTE: 'status-gray', ANNULE: 'status-red'
    };
    return map[statut] ?? 'status-gray';
  }

  trackById(_: number, item: any): number { return item.id; }
}