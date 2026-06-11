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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConventionService } from '../../core/services/convention.service';
import { ConventionFormComponent } from '../convention-form/convention-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SignaturePadComponent } from '../../signature-pad/signature-pad.component';
import { ExportService } from '../../core/services/export.service';
import { StatutLabelPipe } from '../../shared/pipes/statut-label.pipe';

@Component({
  selector: 'app-convention-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatCardModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule, MatProgressBarModule, MatSelectModule,
    MatChipsModule, MatPaginatorModule, SignaturePadComponent, StatutLabelPipe
  ],
  templateUrl: './convention-list.component.html',
  styleUrls: ['./convention-list.component.scss']
})
export class ConventionListComponent implements OnInit {
  @ViewChild('detailDialog')    detailDialog!: TemplateRef<any>;
  @ViewChild('signatureDialog') signatureDialog!: TemplateRef<any>;

  conventions: any[] = [];
  filteredConventions: any[] = [];
  isLoading = true;
  searchKeyword = '';
  selectedStatut = '';
  selectedDept = '';
  selectedConvention: any = null;
  signatureCible: 'stagiaire' | 'encadrant' = 'stagiaire';

  // Pagination
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];

  private api = `${environment.apiUrl}/conventions`;
  readonly statuts = ['BROUILLON', 'EN_VALIDATION', 'SIGNEE', 'ARCHIVEE'];

  get totalConventions(): number { return this.conventions.length; }
  get conventionsSignees(): number { return this.conventions.filter(c => c.statut === 'SIGNEE').length; }
  get conventionsBrouillon(): number { return this.conventions.filter(c => c.statut === 'BROUILLON').length; }
  get partiellementSignees(): number { return this.conventions.filter(c => c.statutSignature === 'PARTIELLEMENT_SIGNEE').length; }
  get filtresActifs(): number { return [this.searchKeyword, this.selectedStatut, this.selectedDept].filter(v => v).length; }
  get departementsDisponibles(): string[] { return [...new Set(this.conventions.map((c: any) => c.departementNom).filter(Boolean))].sort(); }

  get paginatedConventions(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredConventions.slice(start, start + this.pageSize);
  }

  constructor(
    private conventionService: ConventionService,
    private http: HttpClient,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
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
    if (this.selectedStatut) result = result.filter(c => c.statut === this.selectedStatut);
    if (this.selectedDept) result = result.filter(c => c.departementNom === this.selectedDept);
    this.filteredConventions = result;
  }

  onSearch(): void { this.pageIndex = 0; this.applyFilters(); }
  onFilterChange(): void { this.pageIndex = 0; this.applyFilters(); }
  onPageChange(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; }

  resetFiltres(): void {
    this.searchKeyword = ''; this.selectedStatut = ''; this.selectedDept = '';
    this.pageIndex = 0; this.filteredConventions = this.conventions;
  }

  exportExcel(): void { this.exportService.exportConventions(this.conventions); }
  exportPdf(): void { this.exportService.exportConventionsPdf(this.conventions); }

  entiteEdit = '';
  savingEntite = false;

  voirDetail(c: any): void {
    this.selectedConvention = c;
    this.entiteEdit = c.entiteAccueil ?? '';
    this.dialog.open(this.detailDialog, { width: '600px' });
  }

  enregistrerEntite(): void {
    if (!this.selectedConvention) { return; }
    this.savingEntite = true;
    this.http.patch(`${this.api}/${this.selectedConvention.id}/entite-accueil`,
      { entiteAccueil: this.entiteEdit }
    ).subscribe({
      next: (res: any) => {
        this.savingEntite = false;
        this.selectedConvention.entiteAccueil = res?.entiteAccueil ?? this.entiteEdit;
        const inList = this.conventions.find(c => c.id === this.selectedConvention.id);
        if (inList) { inList.entiteAccueil = this.selectedConvention.entiteAccueil; }
        this.snackBar.open('✅ Entité d\'accueil enregistrée', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.savingEntite = false;
        this.snackBar.open('❌ Erreur enregistrement', 'Fermer', { duration: 3000 });
      }
    });
  }

  ouvrirSignature(convention: any, cible: 'stagiaire' | 'encadrant'): void {
    this.selectedConvention = convention;
    this.signatureCible = cible;
    this.dialog.open(this.signatureDialog, { width: '520px', disableClose: false });
  }

  envoyerSignature(signatureBase64: string): void {
    this.http.post(`${this.api}/${this.selectedConvention.id}/signer-electronique`, {
      signature: signatureBase64,
      cible: this.signatureCible
    }).subscribe({
      next: (res: any) => {
        this.snackBar.open('✅ Signature enregistrée !', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.loadConventions();
      },
      error: () => this.snackBar.open('❌ Erreur signature', 'Fermer', { duration: 3000 })
    });
  }

  openForm(convention?: any): void {
    const dialogRef = this.dialog.open(ConventionFormComponent, {
      width: '600px', data: convention || null
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadConventions(); });
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Confirmer la suppression ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.conventionService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Convention supprimée', 'Fermer', { duration: 3000 });
            this.loadConventions();
          }
        });
      }
    });
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
    return nom.split(' ').map(p => p.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  getSignatureLabel(c: any): string {
    if (c.statutSignature === 'SIGNEE_COMPLET') return '✅ Signée complètement';
    if (c.statutSignature === 'PARTIELLEMENT_SIGNEE') return '⚠️ Partiellement signée';
    return '⏳ En attente';
  }

  getSignatureBadgeClass(c: any): string {
    if (c.statutSignature === 'SIGNEE_COMPLET') return 'badge-complete';
    if (c.statutSignature === 'PARTIELLEMENT_SIGNEE') return 'badge-partial';
    return 'badge-pending';
  }
}