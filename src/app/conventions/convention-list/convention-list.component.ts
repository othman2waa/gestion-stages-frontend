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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { ConventionService } from '../../core/services/convention.service';
import { ConventionFormComponent } from '../convention-form/convention-form.component';

@Component({
  selector: 'app-convention-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressBarModule, MatSelectModule, MatChipsModule
  ],
  templateUrl: './convention-list.component.html',
  styleUrls: ['./convention-list.component.scss']
})
export class ConventionListComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  conventions: any[] = [];
  filteredConventions: any[] = [];
  isLoading = true;
  searchKeyword = '';
  selectedStatut = '';
  selectedConvention: any = null;

  readonly statuts = ['BROUILLON', 'EN_VALIDATION', 'SIGNEE', 'ARCHIVEE'];

  get totalConventions(): number { return this.conventions.length; }
  get conventionsSignees(): number { return this.conventions.filter(c => c.statut === 'SIGNEE').length; }
  get conventionsBrouillon(): number { return this.conventions.filter(c => c.statut === 'BROUILLON').length; }
  get filtresActifs(): number { return [this.searchKeyword, this.selectedStatut].filter(v => v).length; }

  constructor(
    private conventionService: ConventionService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadConventions(); }

  loadConventions(): void {
    this.isLoading = true;
    this.conventionService.getAll().subscribe({
      next: (data) => { this.conventions = data; this.applyFilters(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    let result = this.conventions;
    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase();
      result = result.filter(c =>
        c.numero?.toLowerCase().includes(kw) ||
        c.stageSujet?.toLowerCase().includes(kw) ||
        c.stagiaireNom?.toLowerCase().includes(kw)
      );
    }
    if (this.selectedStatut) {
      result = result.filter(c => c.statut === this.selectedStatut);
    }
    this.filteredConventions = result;
  }

  onSearch(): void { this.applyFilters(); }
  onFilterChange(): void { this.applyFilters(); }

  resetFiltres(): void {
    this.searchKeyword = ''; this.selectedStatut = '';
    this.filteredConventions = this.conventions;
  }

  voirDetail(c: any): void {
    this.selectedConvention = c;
    this.dialog.open(this.detailDialog, { width: '600px' });
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
        next: () => { this.snackBar.open('Convention supprimée', 'Fermer', { duration: 3000 }); this.loadConventions(); }
      });
    }
  }

  telechargerPdf(id: number): void {
    this.conventionService.getPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `convention-${id}.pdf`; a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('✅ PDF téléchargé', 'Fermer', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 })
    });
  }

  getStatutClass(statut: string): string {
    const map: any = {
      BROUILLON: 'status-gray', EN_VALIDATION: 'status-orange',
      SIGNEE: 'status-green', ARCHIVEE: 'status-blue'
    };
    return map[statut] ?? 'status-gray';
  }

  getStatutIcon(statut: string): string {
    const map: any = {
      BROUILLON: 'edit_note', EN_VALIDATION: 'pending',
      SIGNEE: 'verified', ARCHIVEE: 'archive'
    };
    return map[statut] ?? 'description';
  }

  getInitials(nom: string): string {
    if (!nom) return '?';
    const parts = nom.split(' ');
    return parts.map(p => p.charAt(0)).join('').toUpperCase().substring(0, 2);
  }
}