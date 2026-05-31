import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { StageService } from '../../core/services/stage.service';
import { StageFormComponent } from '../stage-form/stage-form.component';
import { ExportService } from '../../core/services/export.service';
import { DepartementService } from '../../core/services/departement.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stage-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatCardModule,
    MatSnackBarModule, MatDialogModule, MatTooltipModule,
    MatProgressBarModule, MatSelectModule, MatChipsModule,
    MatPaginatorModule, MatMenuModule, RouterModule
  ],
  templateUrl: './stage-list.component.html',
  styleUrls: ['./stage-list.component.scss']
})
export class StageListComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  stages: any[] = [];
  selectedStage: any = null;
  isLoading = true;

  keyword = '';
  selectedStatut = '';
  selectedTypeStage = '';
  selectedDepartement: any = '';
  sortBy = 'created_at';
  sortDir = 'desc';
  departements: any[] = [];
  private searchSubject = new Subject<void>();

  totalElements = 0;
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];

  get filtresActifs(): number {
    return [this.keyword, this.selectedStatut, this.selectedTypeStage, this.selectedDepartement].filter(v => v).length;
  }

  readonly statuts = [
    'EN_ATTENTE', 'DEMANDE_SOUMISE', 'EN_ATTENTE_VALIDATION', 'VALIDEE',
    'REJETEE', 'CONVENTION_GENEREE', 'CONVENTION_SIGNEE', 'EN_COURS',
    'EN_ATTENTE_EVALUATION', 'TERMINE', 'ANNULE'
  ];

  readonly typesStage = ['PFE', 'PFA', 'STAGE_ETE', 'STAGE_OBSERVATION'];

  readonly progressionMap: Record<string, number> = {
    EN_ATTENTE: 5, DEMANDE_SOUMISE: 15, EN_ATTENTE_VALIDATION: 25,
    VALIDEE: 35, CONVENTION_GENEREE: 50, CONVENTION_SIGNEE: 60,
    EN_COURS: 75, EN_ATTENTE_EVALUATION: 90, TERMINE: 100,
    REJETEE: 0, ANNULE: 0
  };

  constructor(
    private stageService: StageService,
    private departementService: DepartementService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.pageIndex = 0; this.loadStages(); });
    this.departementService.getAll().subscribe(d => this.departements = d);
    this.loadStages();
  }

  loadStages(): void {
    this.isLoading = true;
    const params: any = { page: this.pageIndex, size: this.pageSize, sortBy: this.sortBy, sortDir: this.sortDir };
    if (this.keyword) params['keyword'] = this.keyword;
    if (this.selectedStatut) params['statut'] = this.selectedStatut;
    if (this.selectedTypeStage) params['typeStage'] = this.selectedTypeStage;
    if (this.selectedDepartement) params['departementId'] = this.selectedDepartement;

    console.log('loadStages params:', params);
    this.stageService.rechercher(params).subscribe({
      next: (data) => { this.stages = data.content; this.totalElements = data.totalElements; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  genererLettreAccord(stage: any): void {
    this.http.get(`http://localhost:8080/api/stages/${stage.id}/lettre-accord`, { responseType: "blob" }).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        this.snackBar.open("Lettre d'accord générée avec succès", "Fermer", { duration: 3000 });
      },
      error: (err) => {
        let msg = "Erreur lors de la génération de la lettre";
        if (err.status === 403) msg = "Accès refusé — rôle ADMIN_RH ou RESPONSABLE_RH requis";
        else if (err.status === 404) msg = "Stage introuvable";
        else if (err.status === 500) msg = "Erreur serveur — vérifiez le service PDF backend";
        this.snackBar.open(msg, "Fermer", { duration: 5000 });
      }
    });
  }

  onSearch(): void { this.searchSubject.next(); }
  onFilterChange(): void {
    console.log('onFilterChange called', { statut: this.selectedStatut, type: this.selectedTypeStage, dep: this.selectedDepartement });
    this.pageIndex = 0;
    this.loadStages();
  }
  onPageChange(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.loadStages(); }

  resetFiltres(): void {
    this.keyword = ''; this.selectedStatut = ''; this.selectedTypeStage = '';
    this.selectedDepartement = ''; this.sortBy = 'created_at'; this.sortDir = 'desc';
    this.pageIndex = 0; this.loadStages();
  }

  toggleSortDir(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.loadStages();
  }

  getDepartementNom(id: any): string {
    return this.departements.find(d => d.id === id)?.nom ?? '';
  }

  voirDetail(stage: any): void {
    this.selectedStage = stage;
    this.dialog.open(this.detailDialog, { width: '600px' });
  }

  openForm(stage?: any): void {
    const dialogRef = this.dialog.open(StageFormComponent, { width: '650px', data: stage || null });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadStages(); });
  }

  updateStatut(id: number, statut: string): void {
    this.stageService.updateStatut(id, statut).subscribe({
      next: () => { this.snackBar.open('✅ Statut mis à jour', 'Fermer', { duration: 3000 }); this.loadStages(); }
    });
  }

  delete(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.stageService.delete(id).subscribe({
        next: () => { this.snackBar.open('Stage supprimé', 'Fermer', { duration: 3000 }); this.loadStages(); }
      });
    }
  }

  getStatutClass(statut: string): string {
    const map: any = {
      EN_ATTENTE: 'status-gray', DEMANDE_SOUMISE: 'status-blue',
      EN_ATTENTE_VALIDATION: 'status-orange', VALIDEE: 'status-green',
      REJETEE: 'status-red', CONVENTION_GENEREE: 'status-purple',
      CONVENTION_SIGNEE: 'status-teal', EN_COURS: 'status-blue',
      EN_ATTENTE_EVALUATION: 'status-orange', TERMINE: 'status-green', ANNULE: 'status-red'
    };
    return map[statut] ?? 'status-gray';
  }

  getProgression(statut: string): number {
    return this.progressionMap[statut] ?? 0;
  }

  getInitials(prenom: string, nom: string): string {
    return `${prenom?.charAt(0) ?? ''}${nom?.charAt(0) ?? ''}`.toUpperCase();
  }

  exportExcel(): void { this.exportService.exportStages(this.stages); }
  exportPdf(): void { this.exportService.exportStagesPdf(this.stages); }

  get stagesEnCours(): number { return this.stages.filter(s => s.statut === 'EN_COURS').length; }
  get stagesTermines(): number { return this.stages.filter(s => s.statut === 'TERMINE').length; }
  get stagesEnAttente(): number { return this.stages.filter(s => s.statut === 'EN_ATTENTE').length; }
}