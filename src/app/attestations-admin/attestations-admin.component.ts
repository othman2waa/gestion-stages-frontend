import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ExportService } from '../core/services/export.service';

@Component({
  selector: 'app-attestations-admin',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatSnackBarModule, MatTooltipModule, MatChipsModule,
    FormsModule, MatSelectModule, MatDialogModule, MatPaginatorModule
  ],
  templateUrl: './attestations-admin.component.html',
  styleUrls: ['./attestations-admin.component.scss']
})
export class AttestationsAdminComponent implements OnInit {
  attestations: any[] = [];
  isLoading = true;
  searchTerm = '';
  filterDept = '';
  filterStatut = '';
  private api = `${environment.apiUrl}/attestations`;

  get enAttente(): number { return this.attestations.filter(a => a.statut === 'EN_ATTENTE').length; }
  get approuvees(): number { return this.attestations.filter(a => a.statut === 'APPROUVEE').length; }
  get refusees(): number { return this.attestations.filter(a => a.statut === 'REFUSEE').length; }

  get departementsDisponibles(): string[] {
    return [...new Set(this.attestations.map((a: any) => a.departementNom).filter(Boolean))].sort();
  }

  get filtered(): any[] {
    return this.attestations.filter((a: any) => {
      const s = !this.searchTerm || (a.stagiaireNom + " " + a.stagiairePrenom + " " + a.sujet).toLowerCase().includes(this.searchTerm.toLowerCase());
      const d = !this.filterDept || a.departementNom === this.filterDept;
      const st = !this.filterStatut || a.statut === this.filterStatut;
      return s && d && st;
    });
  }

  // Pagination
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [12, 24, 48];

  get paginatedList(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private dialog: MatDialog, private exportService: ExportService) {}

  ngOnInit(): void { this.loadAttestations(); }

  loadAttestations(): void {
    this.isLoading = true;
    this.http.get<any[]>(this.api).subscribe({
      next: (data) => { this.attestations = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  approuver(att: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approuver l\'attestation',
        message: `Confirmer l'approbation de l'attestation de ${att.stagiaireNom} ?`,
        confirmText: 'Approuver'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      att._processing = true;
      this.http.patch(`${this.api}/${att.id}/approuver`, {}).subscribe({
        next: (data: any) => {
          att._processing = false;
          att.statut = 'APPROUVEE';
          att.numeroAttestation = data.numeroAttestation;
          att.traitePar = data.traitePar;
          this.snackBar.open('Attestation approuvée', 'Fermer', { duration: 3000 });
        },
        error: () => { att._processing = false; this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', { duration: 3000 }); }
      });
    });
  }

  refuser(att: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Refuser l\'attestation',
        message: 'Veuillez indiquer le motif du refus (optionnel) :',
        inputLabel: 'Motif du refus',
        confirmText: 'Refuser',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe((commentaire: string | null) => {
      if (commentaire === null) return;
      att._processing = true;
      this.http.patch(`${this.api}/${att.id}/refuser`, { commentaire }).subscribe({
        next: () => {
          att._processing = false;
          att.statut = 'REFUSEE';
          att.commentaire = commentaire;
          this.snackBar.open('❌ Attestation refusée', 'Fermer', { duration: 3000 });
        },
        error: () => { att._processing = false; this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 }); }
      });
    });
  }

  telechargerPdf(att: any): void {
    this.http.get(`${this.api}/${att.id}/pdf`, { responseType: 'blob' }).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attestation-${att.numeroAttestation}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('✅ PDF téléchargé', 'Fermer', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 })
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  exportExcel(): void {
    const data = this.filtered.map(a => ({
      Stagiaire: a.stagiaireNom,
      Stage: a.stageSujet,
      Département: a.departementNom ?? '',
      Statut: a.statut,
      'N° Attestation': a.numeroAttestation ?? '',
      'Date demande': a.dateDemande ? new Date(a.dateDemande).toLocaleDateString('fr-FR') : '',
      'Traité par': a.traitePar ?? ''
    }));
    this.exportService.exportGeneric(data, 'attestations');
  }

  telechargerBatch(): void {
    const approuvees = this.filtered.filter(a => a.statut === 'APPROUVEE');
    if (approuvees.length === 0) {
      this.snackBar.open('Aucune attestation approuvée à télécharger', 'Fermer', { duration: 3000 });
      return;
    }
    this.snackBar.open(`Téléchargement de ${approuvees.length} attestation(s)...`, 'Fermer', { duration: 2000 });
    approuvees.forEach(att => this.telechargerPdf(att));
  }

  selectedAttestation: any = null;

  voirDetail(att: any): void {
    this.selectedAttestation = att;
  }

  getStatutClass(statut: string): string {
    const map: any = { EN_ATTENTE: 'status-orange', APPROUVEE: 'status-green', REFUSEE: 'status-red' };
    return map[statut] ?? 'status-gray';
  }

  trackById(_: number, item: any): number { return item.id; }
}