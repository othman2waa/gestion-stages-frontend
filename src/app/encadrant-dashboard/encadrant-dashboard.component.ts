import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EncadrantService } from '../core/services/encadrant.service';
import { RapportService } from '../core/services/rapport.service';
import { FicheAppreciationService } from '../core/services/fiche-appreciation.service';
import { FicheAppreciationFormComponent, FicheDialogData } from '../fiche-appreciation-form/fiche-appreciation-form.component';
import { SujetsEncadrantComponent } from '../sujets-encadrant/sujets-encadrant.component';
import { ChatbotEncadrantComponent } from '../chatbot-encadrant/chatbot-encadrant.component';
import { ExportService } from '../core/services/export.service';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule,
    MatTabsModule, MatBadgeModule, MatDialogModule, MatSnackBarModule, SujetsEncadrantComponent, ChatbotEncadrantComponent
  ],
  templateUrl: './encadrant-dashboard.component.html',
  styleUrls: ['./encadrant-dashboard.component.scss']
})
export class EncadrantDashboardComponent implements OnInit {
  @ViewChild('analyseIaDialog') analyseIaDialog!: TemplateRef<any>;

  profil: any = null;
  isLoading = true;
  selectedStagiaire: any = null;
  searchTerm = '';
  etatFilter = ''; // '' = tous, 'ACTIF' = en cours, 'TERMINE' = stage terminé
  notifDismissed = false;

  // Year filter
  availableYears: number[] = [];
  selectedYear: number | null = null;

  readonly statuts = ['EN_COURS', 'TERMINE', 'EN_ATTENTE_EVALUATION', 'CONVENTION_SIGNEE'];

  readonly statutConfig: Record<string, { label: string; color: string; icon: string }> = {
    EN_ATTENTE:             { label:'En attente',      color:'#94A3B8', icon:'hourglass_empty' },
    VALIDEE:                { label:'Validée',          color:'#3B82F6', icon:'verified' },
    CONVENTION_GENEREE:     { label:'Convention générée',color:'#7C3AED',icon:'description' },
    CONVENTION_SIGNEE:      { label:'Convention signée', color:'#0891B2', icon:'draw' },
    EN_COURS:               { label:'En cours',         color:'#00843D', icon:'play_circle' },
    EN_ATTENTE_EVALUATION:  { label:'À évaluer',        color:'#F59E0B', icon:'star_rate' },
    FIN_STAGE:              { label:'Fin de stage',      color:'#F47920', icon:'flag' },
    TERMINE:                { label:'Terminé',           color:'#059669', icon:'check_circle' },
    ANNULE:                 { label:'Annulé',            color:'#DC2626', icon:'cancel' },
  };

  // Track rapport/fiche status per stage
  rapportStatus: Record<number, boolean> = {};
  ficheStageStatus: Record<number, any> = {};
  ficheStagiaireStatus: Record<number, any> = {};
  analyseIa: any = null;
  analyseIaLoading = false;
  analyseIaStagiaire: any = null;

  constructor(
    private http: HttpClient,
    private encadrantService: EncadrantService,
    private rapportService: RapportService,
    private ficheService: FicheAppreciationService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.encadrantService.getMonProfil().subscribe({
      next: (data) => {
        this.profil = data;
        this.isLoading = false;
        this.buildYears();
        this.loadAllFicheStatuses();
      },
      error: () => { this.isLoading = false; }
    });
  }

  private buildYears(): void {
    const years = new Set<number>();
    for (const s of this.profil?.stagiaires ?? []) {
      if (s.dateDebut) {
        const parts = s.dateDebut.split('/');
        if (parts.length === 3) years.add(+parts[2]);
      }
    }
    this.availableYears = Array.from(years).sort((a, b) => b - a);
    if (this.availableYears.length > 0) this.selectedYear = this.availableYears[0];
  }

  private loadAllFicheStatuses(): void {
    for (const s of this.profil?.stagiaires ?? []) {
      if (this.isStageFinished(s.statut)) {
        this.ficheService.getFicheStageByStageId(s.stageId).subscribe({
          next: (f) => this.ficheStageStatus[s.stageId] = f,
          error: () => this.ficheStageStatus[s.stageId] = null
        });
        this.ficheService.getFicheStagiaireByStageId(s.stageId).subscribe({
          next: (f) => this.ficheStagiaireStatus[s.stageId] = f,
          error: () => this.ficheStagiaireStatus[s.stageId] = null
        });
      }
    }
  }

  get filteredStagiaires(): any[] {
    return (this.profil?.stagiaires ?? []).filter((s: any) => {
      const matchSearch = !this.searchTerm ||
        `${s.stagiairePrenom} ${s.stagiaireNom} ${s.sujet}`.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchEtat = !this.etatFilter
        || (this.etatFilter === 'ACTIF' && this.STATUTS_ACTIFS_FULL.includes(s.statut))
        || (this.etatFilter === 'TERMINE' && this.STATUTS_TERMINES_FULL.includes(s.statut));
      return matchSearch && matchEtat;
    });
  }

  get allStagiaires(): any[] { return this.profil?.stagiaires ?? []; }

  // Stagiaires acceptés par encadrant mais en attente validation RH
  private readonly STATUTS_EN_ATTENTE_RH = ['VALIDEE', 'CONVENTION_GENEREE'];
  private readonly STATUTS_ACTIFS = ['CONVENTION_SIGNEE', 'EN_COURS'];
  // Stage « actif » : stage en cours
  private readonly STATUTS_ACTIFS_FULL = ['EN_COURS', 'CONVENTION_SIGNEE'];
  // Stage « terminé / fin de stage » : à évaluer ou clôturé
  private readonly STATUTS_TERMINES_FULL = ['EN_ATTENTE_EVALUATION', 'TERMINE'];

  // Compteurs pour la séparation actifs / terminés
  get nbActifs(): number { return this.allStagiaires.filter((s:any) => this.STATUTS_ACTIFS_FULL.includes(s.statut)).length; }
  get nbTermines(): number { return this.allStagiaires.filter((s:any) => this.STATUTS_TERMINES_FULL.includes(s.statut)).length; }

  get stagiairesEnAttenteRH(): any[] {
    return this.allStagiaires.filter((s: any) => this.STATUTS_EN_ATTENTE_RH.includes(s.statut));
  }

  get stagiairesActifs(): any[] {
    return this.allStagiaires.filter((s: any) => this.STATUTS_ACTIFS.includes(s.statut));
  }

  get enCours(): number { return this.allStagiaires.filter((s:any) => s.statut === 'EN_COURS').length; }
  get aEvaluer(): number { return this.allStagiaires.filter((s:any) => s.statut === 'EN_ATTENTE_EVALUATION').length; }
  get termines(): number { return this.allStagiaires.filter((s:any) => s.statut === 'TERMINE').length; }
  get enAttenteRH(): number { return this.stagiairesEnAttenteRH.length; }

  // Pending fiches notifications
  get pendingFiches(): { stageId: number; nom: string; missingStage: boolean; missingStagiaire: boolean }[] {
    const pending: { stageId: number; nom: string; missingStage: boolean; missingStagiaire: boolean }[] = [];
    for (const s of this.allStagiaires) {
      if (!this.isStageFinished(s.statut)) continue;
      const missingStage = !this.ficheStageStatus[s.stageId];
      const missingStagiaire = !this.ficheStagiaireStatus[s.stageId];
      if (missingStage || missingStagiaire) {
        pending.push({ stageId: s.stageId, nom: `${s.stagiairePrenom} ${s.stagiaireNom}`, missingStage, missingStagiaire });
      }
    }
    return pending;
  }

  dismissNotif(): void { this.notifDismissed = true; }

  exportStagiaires(): void {
    const data = this.filteredStagiaires.map((s: any) => ({
      Stagiaire: `${s.stagiairePrenom} ${s.stagiaireNom}`,
      Sujet: s.sujet, Type: s.typeStage,
      Statut: s.statut?.replace('_', ' '),
      Début: s.dateDebut, Fin: s.dateFin
    }));
    this.exportService.exportGeneric(data, 'mes-stagiaires');
  }

  // Year-based KPIs
  private getStagiairesByYear(year: number | null): any[] {
    if (!year) return this.allStagiaires;
    return this.allStagiaires.filter((s: any) => {
      if (!s.dateDebut) return false;
      const parts = s.dateDebut.split('/');
      return parts.length === 3 && +parts[2] === year;
    });
  }

  get yearStagiaires(): any[] { return this.getStagiairesByYear(this.selectedYear); }
  get yearTotal(): number { return this.yearStagiaires.length; }
  get yearEnCours(): number { return this.yearStagiaires.filter((s:any) => s.statut === 'EN_COURS').length; }
  get yearAEvaluer(): number { return this.yearStagiaires.filter((s:any) => s.statut === 'EN_ATTENTE_EVALUATION').length; }
  get yearTermines(): number { return this.yearStagiaires.filter((s:any) => s.statut === 'TERMINE').length; }
  get yearConventionSignee(): number { return this.yearStagiaires.filter((s:any) => s.statut === 'CONVENTION_SIGNEE').length; }

  getStatutConf(statut: string) { return this.statutConfig[statut] ?? { label: statut, color: '#94A3B8', icon: 'circle' }; }
  getInitials(nom: string, prenom: string): string { return `${prenom?.charAt(0) ?? ''}${nom?.charAt(0) ?? ''}`.toUpperCase(); }
  getProgressColor(p: number): string { return p >= 75 ? '#00843D' : p >= 40 ? '#F47920' : '#3B82F6'; }

  selectStagiaire(s: any): void {
    if (this.selectedStagiaire?.stageId === s.stageId) {
      this.selectedStagiaire = null;
      return;
    }
    this.selectedStagiaire = s;
    this.loadStageExtras(s.stageId);
  }

  private loadStageExtras(stageId: number): void {
    // Check rapport
    this.rapportService.getMeta(stageId).subscribe({
      next: () => this.rapportStatus[stageId] = true,
      error: () => this.rapportStatus[stageId] = false
    });
    // Check fiche stage
    this.ficheService.getFicheStageByStageId(stageId).subscribe({
      next: (f) => this.ficheStageStatus[stageId] = f,
      error: () => this.ficheStageStatus[stageId] = null
    });
    // Check fiche stagiaire
    this.ficheService.getFicheStagiaireByStageId(stageId).subscribe({
      next: (f) => this.ficheStagiaireStatus[stageId] = f,
      error: () => this.ficheStagiaireStatus[stageId] = null
    });
  }

  downloadRapport(stageId: number, event: Event): void {
    event.stopPropagation();
    this.rapportService.download(stageId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.snackBar.open('Erreur téléchargement rapport', 'Fermer', { duration: 3000 })
    });
  }

  openFicheForm(stageId: number, stagiaireNom: string, type: 'STAGE' | 'STAGIAIRE', event: Event): void {
    event.stopPropagation();
    const existing = type === 'STAGE'
      ? this.ficheStageStatus[stageId]
      : this.ficheStagiaireStatus[stageId];

    const dialogData: FicheDialogData = { stageId, stagiaireNom, type, existing: existing ?? undefined };
    const dialogRef = this.dialog.open(FicheAppreciationFormComponent, {
      width: '650px', data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadStageExtras(stageId);
    });
  }

  isStageFinished(statut: string): boolean {
    return statut === 'TERMINE' || statut === 'EN_ATTENTE_EVALUATION';
  }

  allerAuSuivi(stageId?: number): void {
    this.router.navigate(['/suivi-hebdomadaire']);
  }

  allerAuxEvaluations(): void {
    this.router.navigate(['/evaluations']);
  }

  lancerAnalyseIA(s: any, event: Event): void {
    event.stopPropagation();
    this.analyseIaStagiaire = s;
    this.analyseIa = null;
    this.analyseIaLoading = true;
    this.dialog.open(this.analyseIaDialog, { width: '550px' });

    const body = {
      tauxPresence: s.tauxPresence ?? 80,
      moyenneNotes: s.moyenneNotes ?? 14,
      remarques: this.ficheStageStatus[s.stageId]?.appreciationGenerale ?? '',
      appreciationGlobale: this.ficheStagiaireStatus[s.stageId]?.appreciationGenerale ?? ''
    };
    this.http.post<any>(`${environment.apiUrl}/fiches-appreciation/analyse-ia`, body).subscribe({
      next: (data) => { this.analyseIa = data; this.analyseIaLoading = false; },
      error: () => {
        this.analyseIa = { scoreGlobal: 0, synthese: 'Service IA indisponible' };
        this.analyseIaLoading = false;
      }
    });
  }

  getRecoColor(reco: string): string {
    if (reco === 'EXCELLENT') return '#00843D';
    if (reco === 'BIEN') return '#1E40AF';
    if (reco === 'SATISFAISANT') return '#F47920';
    return '#DC2626';
  }
}