import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { StagiaireDashboardService } from '../core/services/stagiaire-dashboard.service';
import { ConventionService } from '../core/services/convention.service';
import { SuiviService } from '../core/services/suivi.service';
import { EvaluationService } from '../core/services/evaluation.service';
import { RapportService } from '../core/services/rapport.service';
import { OnboardingChecklistService } from '../core/services/onboarding-checklist.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DocumentsUploadComponent } from '../documents-upload/documents-upload.component';
import { CandidatureTimelineComponent } from '../candidature-timeline/candidature-timeline.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { FicheRenseignementComponent } from '../fiche-renseignement/fiche-renseignement.component';
import { FicheAppreciationService } from '../core/services/fiche-appreciation.service';
import { DocumentStagiaireService } from '../core/services/document-stagiaire.service';
import { DocumentStagiaireResponse, TYPES_DOCUMENTS } from '../core/models/document-stagiaire.model';



@Component({
  selector: 'app-stagiaire-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule,
    MatSnackBarModule, MatDialogModule, MatTabsModule,DocumentsUploadComponent,CandidatureTimelineComponent,FicheRenseignementComponent,


  ],
  templateUrl: './stagiaire-dashboard.component.html',
  styleUrls: ['./stagiaire-dashboard.component.scss']
})
export class StagiaireDashboardComponent implements OnInit {
  dashboard: any = null;
  profil: any=null;
  suivis: any[] = [];
  evaluations: any[] = [];
  rapport: any = null;
  selectedRapportFile: File | null = null;
  isUploading = false;
  isLoading = true;
  moyenneNote = 0;
checklist: any[] = [];
attestation: any = null;
ficheStage: any = null;
ficheStagiaire: any = null;
mesDocuments: DocumentStagiaireResponse[] = [];
typesDocuments = TYPES_DOCUMENTS;


// ── Désactivation compte ──
get showDeactivationWarning(): boolean {
  return this.dashboard?.stageStatut === 'TERMINE' && !!this.dashboard?.dateDesactivationPrevue;
}

get joursRestants(): number {
  if (!this.dashboard?.dateDesactivationPrevue) return 0;
  const target = new Date(this.dashboard.dateDesactivationPrevue);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

get deactivationUrgency(): 'critical' | 'warning' | 'info' {
  const j = this.joursRestants;
  if (j <= 7) return 'critical';
  if (j <= 15) return 'warning';
  return 'info';
}

get checklistCompleted(): number { return this.checklist.filter(c => c.completed).length; }
get checklistProgression(): number {
  return this.checklist.length > 0 ? Math.round(this.checklistCompleted * 100 / this.checklist.length) : 0;
}

readonly checklistCategories = [
  { key: 'ADMINISTRATIF', label: 'Administratif', icon: 'folder', color: 'blue' },
  { key: 'INFORMATIQUE', label: 'Informatique', icon: 'computer', color: 'purple' },
  { key: 'INTEGRATION', label: 'Intégration', icon: 'people', color: 'green' },
  { key: 'MATERIEL', label: 'Matériel', icon: 'inventory', color: 'orange' },
  { key: 'FORMATION', label: 'Formation', icon: 'school', color: 'teal' }
];

  readonly steps = [
    { key: 'EN_ATTENTE',            label: 'Candidature' },
    { key: 'VALIDEE',               label: 'Validé' },
    { key: 'CONVENTION_GENEREE',    label: 'Convocation' },
    { key: 'CONVENTION_SIGNEE',     label: 'Signée' },
    { key: 'EN_COURS',              label: 'En cours' },
    { key: 'EN_ATTENTE_EVALUATION', label: 'Évaluation' },
    { key: 'TERMINE',               label: 'Terminé' },
  ];

  readonly statutColors: Record<string, string> = {
    EN_ATTENTE: 'status-gray',
    DEMANDE_SOUMISE: 'status-blue',
    EN_ATTENTE_VALIDATION: 'status-orange',
    VALIDEE: 'status-green',
    REJETEE: 'status-red',
    CONVENTION_GENEREE: 'status-purple',
    CONVENTION_SIGNEE: 'status-teal',
    EN_COURS: 'status-blue',
    EN_ATTENTE_EVALUATION: 'status-orange',
    TERMINE: 'status-green',
    ANNULE: 'status-red',
  };

  constructor(
    private dashService: StagiaireDashboardService,
    private conventionService: ConventionService,
    private suiviService: SuiviService,
    private evaluationService: EvaluationService,
    private rapportService: RapportService,
    private snackBar: MatSnackBar,
    private checklistService: OnboardingChecklistService,
    private http: HttpClient,
    private dialog: MatDialog,
    private ficheService: FicheAppreciationService,
    private docStagiaireService: DocumentStagiaireService
  ) {}

  ngOnInit(): void {
    this.dashService.getMonDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
        if (data.stageId) {
          this.loadSuivis(data.stageId);
          this.loadEvaluations();
          this.loadRapport(data.stageId);
          this.loadChecklist();
         this.loadAttestation(data.stageId);
          this.loadFiches(data.stageId);
        }
        this.loadMesDocuments();
      },
      error: () => { this.isLoading = false; }
    });
    this.http.get<any>(`${environment.apiUrl}/stagiaires/mon-profil`).subscribe({
    next: (p) => { this.profil = p; },
    error: () => {}
  });
  }

  loadSuivis(stageId: number): void {
    this.suiviService.getByStage(stageId).subscribe({
      next: (data) => this.suivis = data,
      error: () => {}
    });
  }

  loadEvaluations(): void {
    this.evaluationService.getMesEvaluations().subscribe({
      next: (data) => {
        this.evaluations = data;
        if (data.length > 0)
          this.moyenneNote = data.reduce((sum: number, e: any) => sum + e.note, 0) / data.length;
      },
      error: () => {}
    });
  }

  loadRapport(stageId: number): void {
    this.rapportService.getMeta(stageId).subscribe({
      next: (data) => this.rapport = data,
      error: () => this.rapport = null
    });
  }

  onRapportSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.snackBar.open('Seuls les PDF sont acceptés', 'Fermer', { duration: 3000 });
      return;
    }
    this.selectedRapportFile = file;
  }

  uploadRapport(): void {
    if (!this.selectedRapportFile || !this.dashboard?.stageId) return;
    this.isUploading = true;
    this.rapportService.upload(this.dashboard.stageId, this.selectedRapportFile).subscribe({
      next: (data) => {
        this.rapport = data;
        this.selectedRapportFile = null;
        this.isUploading = false;
        this.snackBar.open('✅ Rapport uploadé avec succès', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.isUploading = false;
        this.snackBar.open('Erreur upload', 'Fermer', { duration: 3000 });
      }
    });
  }

  downloadRapport(): void {
    if (!this.dashboard?.stageId) return;
    this.rapportService.download(this.dashboard.stageId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.rapport?.nomFichier ?? 'rapport.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 })
    });
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getStatutClass(statut: string): string {
    return this.statutColors[statut] ?? 'status-gray';
  }

  isStepDone(stepKey: string): boolean {
    const order = this.steps.map(s => s.key);
    const current = order.indexOf(this.dashboard?.stageStatut);
    const step = order.indexOf(stepKey);
    return step <= current;
  }

  isStepActive(stepKey: string): boolean {
    return this.dashboard?.stageStatut === stepKey;
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

  telechargerConvention(): void {
    if (!this.dashboard?.conventionId) return;
    this.conventionService.getPdf(this.dashboard.conventionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `convocation-${this.dashboard.conventionNumero}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erreur téléchargement PDF', 'Fermer', { duration: 3000 })
    });
  }

    getDays(): { num: number; label: string }[] {
      return [
        { num: 1, label: 'Lun' },
        { num: 2, label: 'Mar' },
        { num: 3, label: 'Mer' },
        { num: 4, label: 'Jeu' },
        { num: 5, label: 'Ven' }
      ];
    }

    getTaches(text: string): string[] {
      if (!text) return [];
      return text.split('\n').map(t => t.replace(/^[-*•]\s*/, '').trim()).filter(t => t);
    }

    loadChecklist(): void {
  this.checklistService.getMonChecklist().subscribe({
    next: (data: any[]) => this.checklist = data,
    error: () => {}
  });
}
getChecklistByCategorie(cat: string): any[] {
  return this.checklist.filter(c => c.categorie === cat);
}


loadFiches(stageId: number): void {
  this.ficheService.getFicheStageByStageId(stageId).subscribe({
    next: (f) => this.ficheStage = f,
    error: () => this.ficheStage = null
  });
  this.ficheService.getFicheStagiaireByStageId(stageId).subscribe({
    next: (f) => this.ficheStagiaire = f,
    error: () => this.ficheStagiaire = null
  });
}

getFicheNoteLabel(n: number): string {
  if (n >= 5) return 'Excellent';
  if (n >= 4) return 'Très bien';
  if (n >= 3) return 'Bien';
  if (n >= 2) return 'Passable';
  return 'Insuffisant';
}

getFicheNoteColor(n: number): string {
  if (n >= 4) return '#16a34a';
  if (n >= 3) return '#2563eb';
  if (n >= 2) return '#d97706';
  return '#dc2626';
}

loadAttestation(stageId: number): void {
  this.http.get<any>(`${environment.apiUrl}/attestations/ma-demande/${stageId}`).subscribe({
    next: (data: any) => this.attestation = data,
    error: () => {}
  });
}

demanderAttestation(): void {
  if (!this.dashboard?.stageId) return;
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '420px',
    data: { title: 'Demande d\'attestation', message: 'Confirmer la demande d\'attestation de stage ?', confirmText: 'Confirmer' }
  });
  dialogRef.afterClosed().subscribe(result => {
    if (!result) return;
    this.http.post<any>(`${environment.apiUrl}/attestations/demander`,
      { stageId: this.dashboard.stageId }).subscribe({
      next: (data: any) => {
        this.attestation = data;
        this.snackBar.open('✅ Demande envoyée au RH', 'Fermer', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Erreur', 'Fermer', { duration: 3000 })
    });
  });
}
telechargerAttestation(): void {
  if (!this.attestation?.id) return;
  this.http.get(`${environment.apiUrl}/attestations/${this.attestation.id}/pdf`,
    { responseType: 'blob' }).subscribe({
    next: (blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${this.attestation.numeroAttestation}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 })
  });
}
telechargerDemande(): void {
  if (!this.attestation?.id) return;
  this.http.get(`${environment.apiUrl}/attestations/${this.attestation.id}/demande-pdf`,
    { responseType: 'blob' }).subscribe({
    next: (blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demande-attestation.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  });
}

// ── Documents personnels ──

loadMesDocuments(): void {
  this.docStagiaireService.getMesDocuments().subscribe({
    next: (docs) => this.mesDocuments = docs,
    error: () => this.mesDocuments = []
  });
}

getDocByType(type: string): DocumentStagiaireResponse | undefined {
  return this.mesDocuments.find(d => d.typeDocument === type);
}

get missingDocsCount(): number {
  const required = ['CV', 'CIN', 'PHOTO', 'DIPLOME'];
  return required.filter(t => !this.getDocByType(t)).length;
}

get dossierCompletionPct(): number {
  const required = ['CV', 'CIN', 'PHOTO', 'DIPLOME'];
  const done = required.filter(t => this.getDocByType(t)).length;
  return Math.round(done * 100 / required.length);
}

onDocSelected(event: any, typeDocument: string): void {
  const file = event.target.files[0];
  if (!file) return;
  this.docStagiaireService.upload(typeDocument, file).subscribe({
    next: () => {
      this.snackBar.open('Document uploadé avec succès', 'Fermer', { duration: 3000 });
      this.loadMesDocuments();
    },
    error: () => this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 })
  });
  event.target.value = '';
}

downloadDoc(docId: number, nomFichier: string): void {
  this.docStagiaireService.download(docId).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomFichier;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 })
  });
}

deleteDoc(docId: number): void {
  this.docStagiaireService.delete(docId).subscribe({
    next: () => {
      this.snackBar.open('Document supprimé', 'Fermer', { duration: 3000 });
      this.loadMesDocuments();
    },
    error: () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 })
  });
}

formatDocSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

}