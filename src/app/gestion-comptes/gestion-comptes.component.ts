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
import { HttpClient } from '@angular/common/http';
import { StagiaireService } from '../core/services/stagiaire.service';
import { ExportService } from '../core/services/export.service';

@Component({
  selector: 'app-gestion-comptes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatInputModule, MatFormFieldModule,
    MatChipsModule, MatTooltipModule, MatSnackBarModule,
    MatProgressBarModule, MatDialogModule
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
  resetPasswordResult: any = null;
  selectedStagiaire: any = null;

  private api = 'http://localhost:8080/api/stagiaires';

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
    const kw = this.searchKeyword.toLowerCase();
    this.filteredStagiaires = this.stagiaires.filter(s =>
      s.nom?.toLowerCase().includes(kw) ||
      s.prenom?.toLowerCase().includes(kw) ||
      s.email?.toLowerCase().includes(kw) ||
      s.username?.toLowerCase().includes(kw)
    );
  }

  selectStagiaire(s: any): void {
    this.selectedStagiaire = s;
    this.dialog.open(this.detailDialog, { width: '500px' });
  }

  toggleActif(stagiaire: any): void {
    const endpoint = stagiaire.actif
      ? `${this.api}/${stagiaire.id}/desactiver`
      : `${this.api}/${stagiaire.id}/activer`;
    this.http.patch(endpoint, {}).subscribe({
      next: () => {
        stagiaire.actif = !stagiaire.actif;
        this.snackBar.open(stagiaire.actif ? '✅ Compte activé' : '🔒 Compte désactivé', 'Fermer', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erreur', 'Fermer', { duration: 3000 })
    });
  }

  resetPassword(stagiaire: any): void {
    if (!confirm(`Réinitialiser le mot de passe de ${stagiaire.prenom} ${stagiaire.nom} ?`)) return;
    this.http.patch<any>(`${this.api}/${stagiaire.id}/reset-password`, {}).subscribe({
      next: (data) => {
        this.resetPasswordResult = { stagiaire, password: data.password };
        this.snackBar.open('✅ Mot de passe réinitialisé — email envoyé', 'Fermer', { duration: 4000 });
      },
      error: () => this.snackBar.open('Erreur reset password', 'Fermer', { duration: 3000 })
    });
  }

  closePasswordResult(): void { this.resetPasswordResult = null; }

  get totalActifs(): number { return this.stagiaires.filter(s => s.actif).length; }
  get totalInactifs(): number { return this.stagiaires.filter(s => !s.actif).length; }


  exportExcel(): void {
  this.exportService.exportStagiaires(this.stagiaires);
}
}