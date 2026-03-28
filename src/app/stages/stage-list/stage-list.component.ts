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
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { StageService } from '../../core/services/stage.service';
import { StageFormComponent } from '../stage-form/stage-form.component';
import { ExportService } from '../../core/services/export.service';



@Component({
  selector: 'app-stage-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatCardModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule,
    MatProgressSpinnerModule, MatChipsModule, MatSelectModule,
    MatPaginatorModule, MatExpansionModule, MatBadgeModule, RouterModule
  ],
  templateUrl: './stage-list.component.html',
  styleUrls: ['./stage-list.component.scss']
})
export class StageListComponent implements OnInit {
  stages: any[] = [];
  isLoading = true;
  displayedColumns = ['sujet', 'stagiaire', 'encadrant', 'type', 'statut', 'dates', 'actions'];

  // Recherche
  keyword = '';
  selectedStatut = '';
  selectedTypeStage = '';
  private searchSubject = new Subject<void>();

  // Pagination
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20];

  // Filtres actifs
  get filtresActifs(): number {
    return [this.keyword, this.selectedStatut, this.selectedTypeStage].filter(v => v).length;
  }

  readonly statuts = [
    'EN_ATTENTE', 'DEMANDE_SOUMISE', 'EN_ATTENTE_VALIDATION', 'VALIDEE',
    'REJETEE', 'CONVENTION_GENEREE', 'CONVENTION_SIGNEE', 'EN_COURS',
    'EN_ATTENTE_EVALUATION', 'TERMINE', 'ANNULE'
  ];

  readonly typesStage = ['PFE', 'PFA', 'STAGE_ETE', 'STAGE_OBSERVATION'];

  constructor(
    private stageService: StageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService,

  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadStages();
    });
    this.loadStages();
  }

  loadStages(): void {
    this.isLoading = true;
    const params: any = {
      page: this.pageIndex,
      size: this.pageSize,
      sortBy: 'createdAt',
      sortDir: 'desc'
    };
    if (this.keyword) params['keyword'] = this.keyword;
    if (this.selectedStatut) params['statut'] = this.selectedStatut;
    if (this.selectedTypeStage) params['typeStage'] = this.selectedTypeStage;

    this.stageService.rechercher(params).subscribe({
      next: (data) => {
        this.stages = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void { this.searchSubject.next(); }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadStages();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStages();
  }

  resetFiltres(): void {
    this.keyword = '';
    this.selectedStatut = '';
    this.selectedTypeStage = '';
    this.pageIndex = 0;
    this.loadStages();
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

  getStatutClass(statut: string): string {
    const colors: any = {
      EN_ATTENTE: 'status-gray', DEMANDE_SOUMISE: 'status-blue',
      EN_ATTENTE_VALIDATION: 'status-orange', VALIDEE: 'status-green',
      REJETEE: 'status-red', CONVENTION_GENEREE: 'status-purple',
      CONVENTION_SIGNEE: 'status-teal', EN_COURS: 'status-blue',
      EN_ATTENTE_EVALUATION: 'status-orange', TERMINE: 'status-green',
      ANNULE: 'status-red'
    };
    return colors[statut] ?? 'status-gray';
  }

  exportExcel(): void {
  this.exportService.exportStages(this.stages);
}
}