import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ExportService } from '../../core/services/export.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatTooltipModule, MatSnackBarModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  stats: any = null;
  compliance: any = null;
  isLoading = true;
  isError = false;
  userRole = '';
  readonly today = new Date();
  private apiBase = `${environment.apiUrl}/reporting`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {}

  get isAdmin(): boolean {
    return ['ADMIN_RH', 'RESPONSABLE_RH'].includes(this.userRole);
  }

  // ── KPIs ──
  get topKpis(): any[] {
    if (!this.stats) return [];
    return [
      { label:'Stagiaires',   value: this.stats.totalStagiaires,  icon:'school',            color:'#1E40AF' },
      { label:'Stages',       value: this.stats.totalStages,      icon:'work',              color:'#00843D' },
      { label:'En cours',     value: this.stats.stagesEnCours,    icon:'play_circle',       color:'#059669' },
      { label:'Convocations',  value: this.stats.totalConventions, icon:'description',       color:'#F47920' },
      { label:'Évaluations',  value: this.stats.totalEvaluations, icon:'star_rate',         color:'#7C3AED' },
      { label:'Encadrants',   value: this.stats.totalEncadrants,  icon:'supervisor_account',color:'#0891B2' },
      { label:'Candidatures', value: this.stats.totalCandidatures,icon:'inbox',             color:'#DC2626' },
      { label:'Annonces',     value: this.stats.totalAnnonces,    icon:'campaign',          color:'#D97706' },
    ];
  }

  // ── Alertes ──
  get alertes(): any[] {
    if (!this.stats) return [];
    const items: any[] = [];
    if ((this.stats.candidaturesEnAttente ?? 0) > 0)
      items.push({ icon:'person_add', color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', label:'Candidature(s) à traiter', val: this.stats.candidaturesEnAttente, route:'/candidatures' });
    if ((this.stats.stagesEnAttenteEvaluation ?? 0) > 0)
      items.push({ icon:'star_rate', color:'#F47920', bg:'#FFF7ED', border:'#FED7AA', label:'Stage(s) à évaluer', val: this.stats.stagesEnAttenteEvaluation, route:'/evaluations' });
    if ((this.stats.attestationsEnAttente ?? 0) > 0)
      items.push({ icon:'workspace_premium', color:'#1E40AF', bg:'#EFF6FF', border:'#BFDBFE', label:'Attestation(s) en attente', val: this.stats.attestationsEnAttente, route:'/attestations' });
    if (this.compliance && this.compliance.dossierIncomplet > 0)
      items.push({ icon:'folder_off', color:'#7C3AED', bg:'#F5F3FF', border:'#DDD6FE', label:'Dossier(s) incomplet(s)', val: this.compliance.dossierIncomplet, route:'' });
    if (items.length === 0)
      items.push({ icon:'check_circle', color:'#00843D', bg:'#F0FDF4', border:'#BBF7D0', label:'Tout est à jour !', val:'✓', route:'' });
    return items;
  }

  // ── Charts data ──

  // Doughnut: Statuts des stages
  get stageStatusChartData(): ChartData<'doughnut'> {
    if (!this.stats) return { labels: [], datasets: [] };
    return {
      labels: ['En attente', 'En cours', 'Convocation générée', 'Convocation signée', 'En attente éval.', 'Terminés', 'Annulés'],
      datasets: [{
        data: [
          this.stats.stagesEnAttente ?? 0,
          this.stats.stagesEnCours ?? 0,
          this.stats.stagesConventionGeneree ?? 0,
          this.stats.stagesConventionSignee ?? 0,
          this.stats.stagesEnAttenteEvaluation ?? 0,
          this.stats.stagesTermines ?? 0,
          this.stats.stagesAnnules ?? 0
        ],
        backgroundColor: ['#F59E0B', '#00843D', '#7C3AED', '#0891B2', '#F47920', '#059669', '#DC2626'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  stageStatusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } }
    }
  };

  // Doughnut: Candidatures
  get candidatureChartData(): ChartData<'doughnut'> {
    if (!this.stats) return { labels: [], datasets: [] };
    return {
      labels: ['En attente', 'Acceptées', 'Refusées'],
      datasets: [{
        data: [
          this.stats.candidaturesEnAttente ?? 0,
          this.stats.candidaturesAcceptees ?? 0,
          this.stats.candidaturesRefusees ?? 0
        ],
        backgroundColor: ['#F59E0B', '#00843D', '#DC2626'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  candidatureChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } }
    }
  };

  // Bar chart: Stages par département
  get deptChartData(): ChartData<'bar'> {
    if (!this.stats?.stagesParDepartement) return { labels: [], datasets: [] };
    const labels = this.stats.stagesParDepartement.map((d: any) => d[0] ?? 'N/A');
    const data = this.stats.stagesParDepartement.map((d: any) => d[1] ?? 0);
    return {
      labels,
      datasets: [{
        label: 'Stages',
        data,
        backgroundColor: '#00843D',
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 28
      }]
    };
  }

  deptChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
      y: { ticks: { font: { size: 11 } }, grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // Bar chart: Stages par type
  get typeChartData(): ChartData<'bar'> {
    if (!this.stats?.stagesParType) return { labels: [], datasets: [] };
    const typeLabels: Record<string, string> = {
      'PFE': 'PFE', 'PFA': 'PFA', 'STAGE_ETE': 'Stage été',
      'STAGE_INITIATION': 'Initiation', 'STAGE_PERFECTIONNEMENT': 'Perfectionnement',
      'STAGE_OBSERVATION': 'Observation'
    };
    const labels = this.stats.stagesParType.map((d: any) => typeLabels[d[0]] ?? d[0]);
    const data = this.stats.stagesParType.map((d: any) => d[1] ?? 0);
    const colors = ['#1E40AF', '#00843D', '#F47920', '#7C3AED', '#0891B2', '#D97706'];
    return {
      labels,
      datasets: [{
        label: 'Stages',
        data,
        backgroundColor: colors.slice(0, data.length),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 32
      }]
    };
  }

  typeChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { font: { size: 11 } }, grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // Polar area: Indicateurs de performance
  get performanceChartData(): ChartData<'polarArea'> {
    if (!this.stats) return { labels: [], datasets: [] };
    return {
      labels: ['Taux acceptation', 'Moy. évaluations', 'Score IA matching', 'Taux complétion'],
      datasets: [{
        data: [
          this.stats.tauxAcceptation ?? 0,
          this.stats.moyenneEvaluations ? Math.round(this.stats.moyenneEvaluations / 20 * 100) : 0,
          this.stats.scoreMoyenMatching ?? 0,
          this.stats.totalStages > 0 ? Math.round(this.stats.stagesTermines / this.stats.totalStages * 100) : 0
        ],
        backgroundColor: ['rgba(0,132,61,0.6)', 'rgba(244,121,32,0.6)', 'rgba(124,58,237,0.6)', 'rgba(30,64,175,0.6)'],
        borderColor: ['#00843D', '#F47920', '#7C3AED', '#1E40AF'],
        borderWidth: 2
      }]
    };
  }

  performanceChartOptions: ChartConfiguration<'polarArea'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: '#e2e8f0' } } },
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } }
    }
  };

  // ── Indicateurs texte ──
  get indicateurs(): any[] {
    if (!this.stats) return [];
    const total = this.stats.totalStages || 1;
    return [
      { label: 'Taux d\'acceptation', value: (this.stats.tauxAcceptation ?? 0) + '%', pct: this.stats.tauxAcceptation ?? 0, cls: 'green' },
      { label: 'Moyenne évaluations', value: (this.stats.moyenneEvaluations ?? 0).toFixed(1) + '/20', pct: (this.stats.moyenneEvaluations ?? 0) / 20 * 100, cls: 'orange' },
      { label: 'Score moyen IA', value: (this.stats.scoreMoyenMatching ?? 0) + '%', pct: this.stats.scoreMoyenMatching ?? 0, cls: 'purple' },
      { label: 'Taux complétion', value: Math.round(this.stats.stagesTermines / total * 100) + '%', pct: this.stats.stagesTermines / total * 100, cls: 'blue' },
    ];
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    if (this.userRole === 'ENCADRANT') {
      this.router.navigate(['/encadrant-dashboard']);
      return;
    }
    if (this.isAdmin) {
      this.http.get<any>(`${this.apiBase}/stats-completes`).subscribe({
        next: (data) => { this.stats = data; this.isLoading = false; this.isError = false; },
        error: () => { this.isLoading = false; this.isError = true; }
      });
      this.http.get<any>(`${environment.apiUrl}/documents-stagiaire/compliance`).subscribe({
        next: (data) => this.compliance = data,
        error: () => {}
      });
    }
  }

  navigate(route: string): void {
    if (route) this.router.navigate([route]);
  }

  printDashboard(): void {
    if (this.isLoading) {
      this.snackBar.open('Veuillez attendre le chargement complet', 'OK', { duration: 3000 });
      return;
    }
    window.print();
  }

  exportExcel(): void {
    if (!this.stats) return;
    const data = [
      { Indicateur: 'Total stagiaires', Valeur: this.stats.totalStagiaires },
      { Indicateur: 'Total stages', Valeur: this.stats.totalStages },
      { Indicateur: 'Stages en cours', Valeur: this.stats.stagesEnCours },
      { Indicateur: 'Stages terminés', Valeur: this.stats.stagesTermines },
      { Indicateur: 'Convocations', Valeur: this.stats.totalConventions },
      { Indicateur: 'Évaluations', Valeur: this.stats.totalEvaluations },
      { Indicateur: 'Encadrants', Valeur: this.stats.totalEncadrants },
      { Indicateur: 'Candidatures', Valeur: this.stats.totalCandidatures },
      { Indicateur: 'Taux acceptation', Valeur: (this.stats.tauxAcceptation ?? 0) + '%' },
      { Indicateur: 'Moyenne évaluations', Valeur: (this.stats.moyenneEvaluations ?? 0).toFixed(1) + '/20' },
      { Indicateur: 'Score moyen IA', Valeur: (this.stats.scoreMoyenMatching ?? 0) + '%' },
    ];
    this.exportService.exportGeneric(data, 'dashboard-rh');
    this.snackBar.open('Export Excel téléchargé', 'OK', { duration: 3000 });
  }

  retry(): void {
    this.isError = false;
    this.ngOnInit();
  }
}
