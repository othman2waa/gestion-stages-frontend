import { Component, OnInit, TemplateRef, ViewChild, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { MatBadgeModule } from '@angular/material/badge';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StagiaireService } from '../../core/services/stagiaire.service';
import { StagiaireFormComponent } from '../stagiaire-form/stagiaire-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-stagiaire-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatCardModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule, MatProgressBarModule,
    MatSelectModule, MatChipsModule, MatBadgeModule, MatPaginatorModule
  ],
  templateUrl: './stagiaire-list.component.html',
  styleUrls: ['./stagiaire-list.component.scss']
})
export class StagiaireListComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;
  private destroyRef = inject(DestroyRef);

  stagiaires: any[] = [];
  filteredStagiaires: any[] = [];
  searchKeyword = '';
  selectedNiveau = '';
  selectedFiliere = '';
  etatStage = ''; // '' = tous, 'ACTIF' = en cours, 'TERMINE' = stage terminé
  isLoading = true;
  selectedStagiaire: any = null;

  // Statuts du stage considérés comme « actif » (stage en cours)
  private readonly STATUTS_ACTIFS = ['EN_COURS', 'CONVENTION_SIGNEE'];
  // Statuts considérés comme « terminé / fin de stage » (à évaluer ou clôturé)
  private readonly STATUTS_TERMINES = ['EN_ATTENTE_EVALUATION', 'TERMINE'];

  // Pagination
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];
  totalElements = 0;

  private searchSubject = new Subject<string>();

  userRole = '';
  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }

  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Master', 'Doctorat'];

  get totalStagiaires(): number { return this.totalElements; }
  get avecCompte(): number { return this.stagiaires.filter(s => s.username).length; }
  get filieres(): string[] {
    return [...new Set(this.stagiaires.map(s => s.filiere).filter(Boolean))];
  }

  constructor(
    private stagiaireService: StagiaireService,
    private authService: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadStagiaires();
    });
    this.loadStagiaires();
  }

  loadStagiaires(): void {
    this.isLoading = true;
    const role = this.authService.getRole() ?? '';

    if (role === 'ENCADRANT') {
      this.stagiaireService.getMesStagiaires().subscribe({
        next: (data) => {
          this.stagiaires = data;
          this.filteredStagiaires = data;
          this.totalElements = data.length;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      const params: any = { page: this.pageIndex, size: this.pageSize };
      if (this.searchKeyword.trim()) params['keyword'] = this.searchKeyword.trim();
      if (this.selectedNiveau) params['niveau'] = this.selectedNiveau;
      if (this.selectedFiliere) params['filiere'] = this.selectedFiliere;
      if (this.etatStage) params['etatStage'] = this.etatStage;

      this.stagiaireService.rechercher(params).subscribe({
        next: (data) => {
          this.stagiaires = data.content;
          this.filteredStagiaires = data.content;
          this.totalElements = data.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  onSearch(): void {
    if (this.isEncadrant) {
      this.applyFilters();
    } else {
      this.searchSubject.next(this.searchKeyword);
    }
  }

  onFilterChange(): void {
    if (this.isEncadrant) {
      this.applyFilters();
    } else {
      this.pageIndex = 0;
      this.loadStagiaires();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStagiaires();
  }

  applyFilters(): void {
    let result = this.stagiaires;
    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase();
      result = result.filter(s =>
        s.nom?.toLowerCase().includes(kw) ||
        s.prenom?.toLowerCase().includes(kw) ||
        s.email?.toLowerCase().includes(kw) ||
        s.cin?.toLowerCase().includes(kw)
      );
    }
    if (this.selectedNiveau) {
      result = result.filter(s => s.niveau === this.selectedNiveau);
    }
    if (this.selectedFiliere) {
      result = result.filter(s => s.filiere === this.selectedFiliere);
    }
    if (this.etatStage === 'ACTIF') {
      result = result.filter(s => this.STATUTS_ACTIFS.includes(s.stageStatut));
    } else if (this.etatStage === 'TERMINE') {
      result = result.filter(s => this.STATUTS_TERMINES.includes(s.stageStatut));
    }
    this.filteredStagiaires = result;
  }

  setEtat(etat: string): void {
    this.etatStage = etat;
    this.pageIndex = 0;
    if (this.isEncadrant) {
      this.applyFilters();
    } else {
      this.loadStagiaires();
    }
  }

  getStageEtat(s: any): { label: string; cls: string } | null {
    if (this.STATUTS_ACTIFS.includes(s.stageStatut)) return { label: 'En cours', cls: 'etat-actif' };
    if (s.stageStatut === 'EN_ATTENTE_EVALUATION') return { label: 'À évaluer', cls: 'etat-termine' };
    if (s.stageStatut === 'TERMINE') return { label: 'Terminé', cls: 'etat-termine' };
    return null;
  }

  resetFiltres(): void {
    this.searchKeyword = '';
    this.selectedNiveau = '';
    this.selectedFiliere = '';
    this.etatStage = '';
    this.pageIndex = 0;
    if (this.isEncadrant) {
      this.filteredStagiaires = this.stagiaires;
    } else {
      this.loadStagiaires();
    }
  }

  voirDetail(s: any): void {
    this.selectedStagiaire = s;
    this.dialog.open(this.detailDialog, { width: '520px' });
  }

  openForm(stagiaire?: any): void {
    const dialogRef = this.dialog.open(StagiaireFormComponent, {
      width: '600px', data: stagiaire || null
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadStagiaires();
    });
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Confirmer la suppression ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.stagiaireService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Stagiaire supprimé', 'Fermer', { duration: 3000 });
            this.loadStagiaires();
          },
          error: () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 })
        });
      }
    });
  }

  exportExcel(): void { this.exportService.exportStagiaires(this.filteredStagiaires); }
  exportPdf(): void { this.exportService.exportStagiairesPdf(this.filteredStagiaires); }

  getInitials(s: any): string {
    return `${s.prenom?.charAt(0) ?? ''}${s.nom?.charAt(0) ?? ''}`.toUpperCase();
  }

  getNiveauClass(niveau: string): string {
    const map: any = {
      'Bac+2': 'n2', 'Bac+3': 'n3', 'Bac+4': 'n4',
      'Bac+5': 'n5', 'Master': 'n5', 'Doctorat': 'n6'
    };
    return map[niveau] ?? 'n3';
  }

  closeDialog(): void { this.dialog.closeAll(); }

  trackById(_: number, item: any): number { return item.id; }
}
