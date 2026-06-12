import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-archives',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatTooltipModule, MatSnackBarModule, MatDialogModule, MatPaginatorModule
  ],
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnInit {

  archives: any[] = [];
  filtered: any[] = [];
  stats: any = null;
  isLoading = true;
  isArchiving = false;
  searchTerm = '';
  filterAnnee: number | null = null;
  filterDept = '';
  filterType = '';

  pageSize = 15;
  pageIndex = 0;
  pageSizeOptions = [15, 30, 50];

  private api = `${environment.apiUrl}/archives`;

  readonly mentions: Record<string, { color: string; bg: string }> = {
    'Très Bien':   { color: '#00843D', bg: '#DCFCE7' },
    'Bien':        { color: '#0891B2', bg: '#E0F2FE' },
    'Assez Bien':  { color: '#7C3AED', bg: '#F5F3FF' },
    'Passable':    { color: '#F47920', bg: '#FFF7ED' },
    'Insuffisant': { color: '#DC2626', bg: '#FEF2F2' },
    'Non évalué':  { color: '#94A3B8', bg: '#F1F5F9' },
  };

  get totalArchives(): number { return this.archives.length; }
  get anneesDisponibles(): number[] {
    return [...new Set(this.archives.map(a => a.anneeStage))].sort((a,b) => b-a);
  }
  get departementsDisponibles(): string[] {
    return [...new Set(this.archives.map(a => a.departementNom).filter(Boolean))].sort();
  }
  get typesDisponibles(): string[] {
    return [...new Set(this.archives.map(a => a.typeStage).filter(Boolean))].sort();
  }

  get paginatedArchives(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadArchives();
    this.loadStats();
  }

  loadArchives(): void {
    this.isLoading = true;
    let url = `${this.api}?`;
    if (this.filterAnnee) url += `annee=${this.filterAnnee}&`;
    if (this.filterDept)  url += `departement=${encodeURIComponent(this.filterDept)}&`;
    this.http.get<any[]>(url).subscribe({
      next: (d) => { this.archives = d; this.applyFilter(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  loadStats(): void {
    this.http.get<any>(`${this.api}/stats`).subscribe({
      next: (s) => this.stats = s,
      error: () => {}
    });
  }

  applyFilter(): void {
    this.pageIndex = 0;
    this.filtered = this.archives.filter(a => {
      const matchSearch = !this.searchTerm ||
        `${a.stagiaireNom} ${a.stagiaireEmail} ${a.sujet} ${a.encadrantNom}`
          .toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = !this.filterType || a.typeStage === this.filterType;
      return matchSearch && matchType;
    });
  }

  onFilterChange(): void { this.loadArchives(); }

  archiverTous(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Archivage', message: 'Archiver tous les stages terminés ?', confirmText: 'Archiver' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.isArchiving = true;
      this.http.post(`${this.api}/archiver-tous`, {}).subscribe({
        next: (res: any) => {
          this.isArchiving = false;
          this.snackBar.open(`✅ ${res.total} stage(s) archivé(s)`, 'Fermer', { duration: 4000 });
          this.loadArchives();
          this.loadStats();
        },
        error: () => { this.isArchiving = false; }
      });
    });
  }

  isPurging = false;

  purgerExpirees(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      data: {
        title: 'Purge de rétention',
        message: 'Anonymiser les archives dont le stage est terminé depuis plus d\'un an et supprimer définitivement leurs documents ? Seuls les indicateurs (KPIs) seront conservés. Cette action est irréversible.',
        confirmText: 'Purger'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) { return; }
      this.isPurging = true;
      this.http.post(`${this.api}/purger`, {}).subscribe({
        next: (res: any) => {
          this.isPurging = false;
          this.snackBar.open(`✅ ${res.anonymises} archive(s) anonymisée(s) — documents supprimés`, 'Fermer', { duration: 4500 });
          this.loadArchives();
          this.loadStats();
        },
        error: () => {
          this.isPurging = false;
          this.snackBar.open('❌ Erreur lors de la purge', 'Fermer', { duration: 3000 });
        }
      });
    });
  }

  exportExcel(): void {
    const headers = ['Stagiaire', 'Email', 'Filière', 'Niveau', 'Établissement',
                     'Encadrant', 'Département', 'Sujet', 'Type', 'Début', 'Fin',
                     'Note', 'Mention', 'Année'];
    const rows = this.filtered.map(a => [
      a.stagiaireNom, a.stagiaireEmail, a.stagiaireFiliere, a.stagiaireNiveau,
      a.stagiaireEtablissement, a.encadrantNom, a.departementNom, a.sujet,
      a.typeStage, a.dateDebut, a.dateFin, a.noteFinale, a.mention, a.anneeStage
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `archives_stages_${new Date().getFullYear()}.csv`;
    a.click(); URL.revokeObjectURL(url);
    this.snackBar.open('✅ Export Excel téléchargé', 'Fermer', { duration: 3000 });
  }

  getMentionStyle(mention: string) {
    return this.mentions[mention] ?? { color: '#94A3B8', bg: '#F1F5F9' };
  }

  getTypeColor(type: string): string {
    const map: any = {
      'PFE': '#00843D', 'PFA': '#0891B2',
      'STAGE_ETE': '#F47920', 'STAGE_OBSERVATION': '#7C3AED'
    };
    return map[type] ?? '#94A3B8';
  }

  getDurationDays(debut: string, fin: string): number {
    if (!debut || !fin) return 0;
    const d1 = new Date(debut), d2 = new Date(fin);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }
}