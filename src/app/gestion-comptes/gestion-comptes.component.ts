import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StagiaireService } from '../core/services/stagiaire.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ExportService } from '../core/services/export.service';

@Component({
  selector: 'app-gestion-comptes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatInputModule, MatFormFieldModule,
    MatChipsModule, MatTooltipModule, MatSnackBarModule,
    MatProgressBarModule, MatDialogModule, MatPaginatorModule, MatSelectModule
  ],
  templateUrl: './gestion-comptes.component.html',
  styleUrls: ['./gestion-comptes.component.scss']
})
export class GestionComptesComponent implements OnInit {
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  stagiaires: any[] = [];
  filteredStagiaires: any[] = [];
  isLoading = true;
  searchKeyword = '';
  filterStatut = '';
  resetPasswordResult: any = null;
  selectedStagiaire: any = null;

  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];

  private api = `${environment.apiUrl}/stagiaires`;

  constructor(
    private stagiaireService: StagiaireService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private exportService: ExportService,

  ) {}

  ngOnInit(): void {
    this.loadComptes();
  }

  loadComptes(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.api}/comptes`).subscribe({
      next: (data) => {
        this.stagiaires = data;
        this.filteredStagiaires = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void {
    this.pageIndex = 0;
    const kw = this.searchKeyword.toLowerCase();
    this.filteredStagiaires = this.stagiaires.filter(s => {
      const matchSearch = !kw ||
        s.nom?.toLowerCase().includes(kw) ||
        s.prenom?.toLowerCase().includes(kw) ||
        s.email?.toLowerCase().includes(kw) ||
        s.username?.toLowerCase().includes(kw);
      const matchStatut = !this.filterStatut ||
        (this.filterStatut === 'actif' && s.actif) ||
        (this.filterStatut === 'inactif' && !s.actif);
      return matchSearch && matchStatut;
    });
  }

  get paginatedStagiaires(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredStagiaires.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  selectStagiaire(s: any): void {
    this.selectedStagiaire = s;
    this.dialog.open(this.detailDialog, { width: '500px' });
  }

  toggleActif(stagiaire: any): void {
    const action = stagiaire.actif ? 'désactiver' : 'activer';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: stagiaire.actif ? 'Désactiver le compte' : 'Activer le compte',
        message: `Voulez-vous ${action} le compte de ${stagiaire.prenom} ${stagiaire.nom} ?`,
        confirmText: stagiaire.actif ? 'Désactiver' : 'Activer'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      const endpoint = stagiaire.actif
        ? `${this.api}/${stagiaire.id}/desactiver`
        : `${this.api}/${stagiaire.id}/activer`;
      this.http.patch(endpoint, {}).subscribe({
        next: () => {
          stagiaire.actif = !stagiaire.actif;
          this.snackBar.open(stagiaire.actif ? 'Compte activé' : 'Compte désactivé', 'Fermer', { duration: 3000 });
        },
        error: () => this.snackBar.open('Erreur', 'Fermer', { duration: 3000 })
      });
    });
  }

  resetPassword(stagiaire: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Réinitialisation',
        message: `Réinitialiser le mot de passe de ${stagiaire.prenom} ${stagiaire.nom} ?`,
        confirmText: 'Réinitialiser'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.http.patch<any>(`${this.api}/${stagiaire.id}/reset-password`, {}).subscribe({
        next: (data) => {
          this.resetPasswordResult = { stagiaire, password: data.password };
          this.snackBar.open('✅ Mot de passe réinitialisé — email envoyé', 'Fermer', { duration: 4000 });
        },
        error: () => this.snackBar.open('Erreur reset password', 'Fermer', { duration: 3000 })
      });
    });
  }

  closePasswordResult(): void { this.resetPasswordResult = null; }

  copyPassword(): void {
    if (this.resetPasswordResult?.password) {
      navigator.clipboard.writeText(this.resetPasswordResult.password);
      this.snackBar.open('Mot de passe copié', 'Fermer', { duration: 2000 });
    }
  }

  get totalActifs(): number { return this.stagiaires.filter(s => s.actif).length; }
  get totalInactifs(): number { return this.stagiaires.filter(s => !s.actif).length; }


  exportExcel(): void {
  this.exportService.exportStagiaires(this.stagiaires);
}
exportPdf(): void {
  this.exportService.exportCandidaturesPdf(this.stagiaires);
}

}