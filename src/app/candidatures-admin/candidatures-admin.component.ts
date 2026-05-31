import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CandidatureService } from '../core/services/candidature.service';
import { EncadrantService } from '../core/services/encadrant.service';
import { DepartementService } from '../core/services/departement.service';
import { ExportService } from '../core/services/export.service';

@Component({
  selector: 'app-candidatures-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatProgressBarModule, MatTooltipModule, MatTabsModule,
    MatBadgeModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './candidatures-admin.component.html',
  styleUrls: ['./candidatures-admin.component.scss']
})
export class CandidaturesAdminComponent implements OnInit {

  @ViewChild('acceptDialog')    acceptDialog!:    TemplateRef<any>;
  @ViewChild('detailDialog')    detailDialog!:    TemplateRef<any>;
  @ViewChild('refusDialog')     refusDialog!:     TemplateRef<any>;
  @ViewChild('documentsDialog') documentsDialog!: TemplateRef<any>;

  candidatures: any[] = [];
  encadrants: any[] = [];
  departements: any[] = [];
  isLoading = true;
  selectedCandidature: any = null;
  searchTerm = '';
  filterStatut = '';
  filterDept = '';
  documents: any[] = [];
  iaResult: any = null;
  isVerifyingIa = false;

  acceptForm: FormGroup;
  refusForm: FormGroup;

  readonly typeStages = [
    { value: 'PFE', label: 'Projet de Fin d\'Études (PFE)' },
    { value: 'PFA', label: 'Projet de Fin d\'Année (PFA)' },
    { value: 'STAGE_ETE', label: 'Stage d\'Été' },
    { value: 'STAGE_OBSERVATION', label: 'Stage d\'Observation' }
  ];

  readonly statutConf: Record<string, { label: string; color: string; icon: string }> = {
    EN_ATTENTE:           { label: 'En attente',          color: '#F59E0B', icon: 'hourglass_empty' },
    MEETING_PLANIFIE:     { label: 'Meeting planifié',     color: '#0891B2', icon: 'event' },
    ACCEPTEE_ENCADRANT:   { label: 'Accepté encadrant',    color: '#7C3AED', icon: 'how_to_reg' },
    REFUSEE_ENCADRANT:    { label: 'Refusé encadrant',     color: '#DC2626', icon: 'cancel' },
    DOCUMENTS_REQUIS:     { label: 'Docs requis',          color: '#F47920', icon: 'upload_file' },
    DOCUMENTS_SOUMIS:     { label: 'Docs soumis',          color: '#0891B2', icon: 'task_alt' },
    VERIFICATION_IA:      { label: 'Vérification IA',      color: '#7C3AED', icon: 'psychology' },
    ACCEPTEE_RH:          { label: 'Validé RH ✅',         color: '#00843D', icon: 'verified' },
    REFUSEE_RH:           { label: 'Refusé RH',            color: '#DC2626', icon: 'cancel' },
    ACCEPTEE:             { label: 'Acceptée',             color: '#00843D', icon: 'check_circle' },
    REFUSEE:              { label: 'Refusée',              color: '#DC2626', icon: 'cancel' },
  };

  get enAttente(): any[]         { return this.candidatures.filter(c => c.statut === 'EN_ATTENTE'); }
  get acceptees(): any[]         { return this.candidatures.filter(c => ['ACCEPTEE','ACCEPTEE_RH'].includes(c.statut)); }
  get refusees(): any[]          { return this.candidatures.filter(c => ['REFUSEE','REFUSEE_RH','REFUSEE_ENCADRANT'].includes(c.statut)); }
  get aTraiterRH(): any[]        { return this.candidatures.filter(c => ['ACCEPTEE_ENCADRANT','DOCUMENTS_SOUMIS','VERIFICATION_IA'].includes(c.statut)); }

  get filtered(): any[] {
  return this.candidatures.filter(c => {
    const matchSearch = !this.searchTerm ||
      `${c.prenom} ${c.nom} ${c.email} ${c.filiere} ${c.etablissement}`
        .toLowerCase().includes(this.searchTerm.toLowerCase());
    const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
    const matchDept   = !this.filterDept   || c.departementNom === this.filterDept;
    return matchSearch && matchStatut && matchDept;
  });
}

get departementsDisponibles(): string[] {
  return [...new Set(this.candidatures
    .map(c => c.departementNom)
    .filter(Boolean))].sort();
}



  getConf(statut: string) {
    return this.statutConf[statut] ?? { label: statut, color: '#94A3B8', icon: 'circle' };
  }

  constructor(
    private candidatureService: CandidatureService,
    private encadrantService: EncadrantService,
    private deptService: DepartementService,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {
    this.acceptForm = this.fb.group({
      encadrantId:    [null, Validators.required],
      departementId:  [null, Validators.required],
      dateDebut:      [null, Validators.required],
      dateFin:        [null, Validators.required],
      typeStage:      ['PFE', Validators.required],
      sujet:          [''],
      commentaireRh:  ['']
    });
    this.refusForm = this.fb.group({ commentaireRh: [''] });
  }

  ngOnInit(): void {
    this.loadCandidatures();
    this.encadrantService.getAll().subscribe(d => this.encadrants = d);
    this.deptService.getActifs().subscribe(d => this.departements = d);
  }

  loadCandidatures(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/candidatures/rh`).subscribe({
  next: (data) => { this.candidatures = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  ouvrirDetail(c: any): void {
    this.selectedCandidature = c;
    this.dialog.open(this.detailDialog, { width: '650px' });
  }

  ouvrirAcceptation(c: any): void {
    this.selectedCandidature = c;
    this.acceptForm.reset({ typeStage: 'PFE', sujet: c.sujetSouhaite ?? '' });
    this.dialog.open(this.acceptDialog, { width: '600px', disableClose: true });
  }

  ouvrirRefus(c: any): void {
    this.selectedCandidature = c;
    this.refusForm.reset();
    this.dialog.open(this.refusDialog, { width: '450px' });
  }

  // ── Voir documents + vérification IA
  ouvrirDocuments(c: any): void {
    this.selectedCandidature = c;
    this.documents = [];
    this.iaResult = null;
    this.http.get<any[]>(`${environment.apiUrl}/candidatures/${c.id}/documents`).subscribe({
      next: (docs) => this.documents = docs,
      error: () => this.snackBar.open('Erreur chargement documents', 'Fermer', { duration: 3000 })
    });
    this.dialog.open(this.documentsDialog, { width: '750px' });
  }

  lancerVerificationIa(): void {
    if (!this.selectedCandidature) return;
    this.isVerifyingIa = true;
    this.http.post(`${environment.apiUrl}/candidatures/${this.selectedCandidature.id}/verifier-ia`, {})
      .subscribe({
        next: (result: any) => {
          this.iaResult = result;
          this.isVerifyingIa = false;
          this.snackBar.open(`🤖 Score IA : ${result.scoreMoyen}%`, 'Fermer', { duration: 3000 });
          this.loadCandidatures();
        },
        error: () => { this.isVerifyingIa = false; this.snackBar.open('Erreur vérification IA', 'Fermer', { duration: 3000 }); }
      });
  }

  validerDossier(decision: string): void {
    if (!this.selectedCandidature) return;
    this.http.patch(`${environment.apiUrl}/candidatures/${this.selectedCandidature.id}/valider-final`,
      { decision, commentaire: '' }
    ).subscribe({
      next: () => {
        const msg = decision === 'VALIDE'
          ? '✅ Dossier validé — Convocation envoyée !'
          : '❌ Dossier refusé';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        this.dialog.closeAll();
        this.loadCandidatures();
      },
      error: () => this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 })
    });
  }

  accepter(): void {
    if (this.acceptForm.invalid || !this.selectedCandidature) return;
    this.candidatureService.traiter(this.selectedCandidature.id,
      { statut: 'ACCEPTEE', ...this.acceptForm.value }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Candidature acceptée', 'Fermer', { duration: 3000 });
        this.dialog.closeAll(); this.loadCandidatures();
      },
      error: () => this.snackBar.open('Erreur lors de l\'acceptation', 'Fermer', { duration: 3000 })
    });
  }

  refuser(): void {
    if (!this.selectedCandidature) return;
    this.candidatureService.traiter(this.selectedCandidature.id,
      { statut: 'REFUSEE', commentaireRh: this.refusForm.value.commentaireRh }
    ).subscribe({
      next: () => {
        this.snackBar.open('❌ Candidature refusée', 'Fermer', { duration: 3000 });
        this.dialog.closeAll(); this.loadCandidatures();
      },
      error: () => this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 })
    });
  }

  voirCv(id: number): void {
    this.candidatureService.getCv(id).subscribe({
      next: (blob) => window.open(window.URL.createObjectURL(blob), '_blank'),
      error: () => this.snackBar.open('Erreur CV', 'Fermer', { duration: 3000 })
    });
  }

  getDocStatut(statut: string) {
    if (statut === 'VALIDE')  return { color: '#00843D', icon: 'check_circle' };
    if (statut === 'SUSPECT') return { color: '#DC2626', icon: 'warning' };
    return { color: '#94A3B8', icon: 'pending' };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#00843D';
    if (score >= 60) return '#F47920';
    return '#DC2626';
  }

  get docssoumis(): any[] {
  return this.candidatures.filter(c => c.statut === 'DOCUMENTS_SOUMIS');
}

  exportExcel(): void { this.exportService.exportCandidatures(this.candidatures); }
  exportPdf():   void { this.exportService.exportCandidaturesPdf(this.candidatures); }

  trackById(_: number, item: any): number { return item.id; }
}