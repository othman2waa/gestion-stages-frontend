import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { CandidatureService } from '../core/services/candidature.service';
import { EncadrantService } from '../core/services/encadrant.service';
import { ExportService } from '../core/services/export.service';





@Component({
  selector: 'app-candidatures-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatProgressBarModule, MatTooltipModule, MatTabsModule, MatBadgeModule
  ],
  templateUrl: './candidatures-admin.component.html',
  styleUrls: ['./candidatures-admin.component.scss']
})
export class CandidaturesAdminComponent implements OnInit {
  candidatures: any[] = [];
  encadrants: any[] = [];
  isLoading = true;
  selectedCandidature: any = null;
  showTraiterForm = false;

  traiterForm: FormGroup;

  get enAttente(): any[] { return this.candidatures.filter(c => c.statut === 'EN_ATTENTE'); }
  get acceptees(): any[] { return this.candidatures.filter(c => c.statut === 'ACCEPTEE'); }
  get refusees(): any[] { return this.candidatures.filter(c => c.statut === 'REFUSEE'); }

  constructor(
    private candidatureService: CandidatureService,
    private encadrantService: EncadrantService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private exportService: ExportService,

  ) {
    this.traiterForm = this.fb.group({
      statut: [''],
      commentaireRh: [''],
      encadrantId: [null],
      departementId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCandidatures();
    this.encadrantService.getAll().subscribe(d => this.encadrants = d);
  }

  loadCandidatures(): void {
    this.isLoading = true;
    this.candidatureService.getAll().subscribe({
      next: (data) => { this.candidatures = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  selectCandidature(c: any): void {
    this.selectedCandidature = c;
    this.showTraiterForm = false;
    this.traiterForm.reset();
  }

  ouvrirTraitement(statut: string): void {
    this.traiterForm.patchValue({ statut });
    this.showTraiterForm = true;
  }

  traiter(): void {
    if (!this.selectedCandidature) return;
    this.candidatureService.traiter(this.selectedCandidature.id, this.traiterForm.value).subscribe({
      next: () => {
        const msg = this.traiterForm.value.statut === 'ACCEPTEE'
          ? '✅ Candidature acceptée — compte créé et email envoyé'
          : '❌ Candidature refusée — email envoyé';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        this.selectedCandidature = null;
        this.showTraiterForm = false;
        this.loadCandidatures();
      },
      error: () => this.snackBar.open('Erreur lors du traitement', 'Fermer', { duration: 3000 })
    });
  }

  voirCv(id: number): void {
  this.candidatureService.getCv(id).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    },
    error: () => this.snackBar.open('Erreur chargement CV', 'Fermer', { duration: 3000 })
  });
}

  getStatutClass(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'statut-attente',
      'ACCEPTEE': 'statut-acceptee',
      'REFUSEE': 'statut-refusee'
    };
    return map[statut] ?? '';
  }

  getStatutIcon(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'hourglass_empty',
      'ACCEPTEE': 'check_circle',
      'REFUSEE': 'cancel'
    };
    return map[statut] ?? 'help';
  }
  exportExcel(): void {
  this.exportService.exportCandidatures(this.candidatures);
}

}