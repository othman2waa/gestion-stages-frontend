import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
    MatSelectModule, MatChipsModule, MatBadgeModule
  ],
  templateUrl: './stagiaire-list.component.html',
  styleUrls: ['./stagiaire-list.component.scss']
})
export class StagiaireListComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  stagiaires: any[] = [];
  filteredStagiaires: any[] = [];
  searchKeyword = '';
  selectedNiveau = '';
  selectedFiliere = '';
  isLoading = true;
  selectedStagiaire: any = null;

  userRole = '';
  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }

  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Master', 'Doctorat'];

  get totalStagiaires(): number { return this.stagiaires.length; }
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
    this.loadStagiaires();
  }

loadStagiaires(): void {
  this.isLoading = true;
  const role = this.authService.getRole() ?? '';

  const obs = role === 'ENCADRANT'
    ? this.stagiaireService.getMesStagiaires()
    : this.stagiaireService.getAll();

  obs.subscribe({
    next: (data) => {
      this.stagiaires = data;
      this.filteredStagiaires = data;
      this.isLoading = false;
    },
    error: () => this.isLoading = false
  });
}

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
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
    this.filteredStagiaires = result;
  }

  resetFiltres(): void {
    this.searchKeyword = '';
    this.selectedNiveau = '';
    this.selectedFiliere = '';
    this.filteredStagiaires = this.stagiaires;
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