import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { FicheAppreciationService } from '../core/services/fiche-appreciation.service';
import { ExportService } from '../core/services/export.service';
import { FicheStageResponse, FicheStagiaireResponse } from '../core/models/fiche-appreciation.model';

@Component({
  selector: 'app-fiches-appreciation-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatSelectModule, MatFormFieldModule,
    MatPaginatorModule, MatChipsModule, MatTooltipModule, MatInputModule
  ],
  templateUrl: './fiches-appreciation-admin.component.html',
  styleUrls: ['./fiches-appreciation-admin.component.scss']
})
export class FichesAppreciationAdminComponent implements OnInit {
  fichesStage: FicheStageResponse[] = [];
  fichesStagiaire: FicheStagiaireResponse[] = [];
  filteredFichesStage: FicheStageResponse[] = [];
  filteredFichesStagiaire: FicheStagiaireResponse[] = [];
  isLoading = true;

  activeTab: 'stage' | 'stagiaire' = 'stage';
  searchKeyword = '';
  selectedNiveau = '';

  // Pagination
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];

  get currentList(): any[] {
    return this.activeTab === 'stage' ? this.filteredFichesStage : this.filteredFichesStagiaire;
  }

  get paginatedList(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.currentList.slice(start, start + this.pageSize);
  }

  get totalFichesStage(): number { return this.fichesStage.length; }
  get totalFichesStagiaire(): number { return this.fichesStagiaire.length; }

  get moyenneStage(): number {
    if (!this.fichesStage.length) return 0;
    return this.fichesStage.reduce((s, f) => s + (f.moyenneGenerale ?? 0), 0) / this.fichesStage.length;
  }

  get moyenneStagiaire(): number {
    if (!this.fichesStagiaire.length) return 0;
    return this.fichesStagiaire.reduce((s, f) => s + (f.moyenneGenerale ?? 0), 0) / this.fichesStagiaire.length;
  }

  constructor(private ficheService: FicheAppreciationService, private exportService: ExportService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    let loaded = 0;
    const check = () => { loaded++; if (loaded >= 2) this.isLoading = false; };

    this.ficheService.getAllFichesStage().subscribe({
      next: (data) => { this.fichesStage = data; this.filteredFichesStage = data; check(); },
      error: () => check()
    });
    this.ficheService.getAllFichesStagiaire().subscribe({
      next: (data) => { this.fichesStagiaire = data; this.filteredFichesStagiaire = data; check(); },
      error: () => check()
    });
  }

  switchTab(tab: 'stage' | 'stagiaire'): void {
    this.activeTab = tab;
    this.pageIndex = 0;
    this.searchKeyword = '';
    this.applyFilters();
  }

  onSearch(): void { this.pageIndex = 0; this.applyFilters(); }

  applyFilters(): void {
    const kw = this.searchKeyword.toLowerCase();
    const filterFn = (f: any) => {
      const matchKw = !kw || f.stageSujet?.toLowerCase().includes(kw) ||
        f.stagiaireNom?.toLowerCase().includes(kw) ||
        f.encadrantNom?.toLowerCase().includes(kw);
      if (!matchKw) return false;
      if (this.selectedNiveau) {
        const n = f.moyenneGenerale ?? 0;
        switch (this.selectedNiveau) {
          case 'excellent': return n >= 16;
          case 'bien': return n >= 12 && n < 16;
          case 'passable': return n >= 10 && n < 12;
          case 'insuffisant': return n < 10;
        }
      }
      return true;
    };
    if (this.activeTab === 'stage') {
      this.filteredFichesStage = this.fichesStage.filter(filterFn);
    } else {
      this.filteredFichesStagiaire = this.fichesStagiaire.filter(filterFn);
    }
    this.pageIndex = 0;
  }

  get filtresActifs(): number {
    return [this.searchKeyword, this.selectedNiveau].filter(v => v).length;
  }

  exportExcel(): void {
    const data = this.currentList.map(f => ({
      Stagiaire: f.stagiaireNom, Stage: f.stageSujet, Encadrant: f.encadrantNom,
      'Moyenne /20': f.moyenneGenerale, Date: f.createdAt
    }));
    this.exportService.exportGeneric(data, `fiches-${this.activeTab}`);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'note-excellent';
    if (note >= 12) return 'note-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
  }

  getNoteLabel(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getRecoClass(reco: string): string {
    if (reco === 'FORTEMENT_RECOMMANDE' || reco === 'OUI') return 'reco-yes';
    if (reco === 'RECOMMANDE' || reco === 'PEUT_ETRE') return 'reco-maybe';
    return 'reco-no';
  }

  getRecoLabel(reco: string): string {
    const map: Record<string, string> = {
      FORTEMENT_RECOMMANDE: 'Fortement recommandé', RECOMMANDE: 'Recommandé',
      NON_RECOMMANDE: 'Non recommandé', OUI: 'Oui', NON: 'Non', PEUT_ETRE: 'Peut-être'
    };
    return map[reco] ?? reco?.replace('_', ' ') ?? '—';
  }
}
