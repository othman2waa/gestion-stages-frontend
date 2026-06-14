import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { ExportService } from '../core/services/export.service';
import { StatCardComponent } from '../shared/stat-card/stat-card.component';

Chart.register(...registerables);

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [
    StatCardComponent,CommonModule, FormsModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatTooltipModule, MatTabsModule, BaseChartDirective],
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  readonly today = new Date();

  constructor(private http: HttpClient, private exportService: ExportService) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/reporting/stats-completes`).subscribe({
      next: (data) => { this.stats = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  // ── KPI cards ──
  get kpis(): any[] {
    if (!this.stats) return [];
    const total = this.stats.totalStages || 1;
    return [
      { label: 'Taux acceptation', value: (this.stats.tauxAcceptation ?? 0) + '%', icon: 'thumb_up', color: '#00843D', bg: '#F0FDF4' },
      { label: 'Taux complétion', value: Math.round((this.stats.stagesTermines ?? 0) / total * 100) + '%', icon: 'check_circle', color: '#1E40AF', bg: '#EFF6FF' },
      { label: 'Moyenne évaluations', value: (this.stats.moyenneEvaluations ?? 0).toFixed(1) + '/20', icon: 'grade', color: '#F47920', bg: '#FFF7ED' },
      { label: 'Score IA matching', value: (this.stats.scoreMoyenMatching ?? 0) + '%', icon: 'psychology', color: '#7C3AED', bg: '#F5F3FF' },
      { label: 'Stages en cours', value: this.stats.stagesEnCours ?? 0, icon: 'play_circle', color: '#059669', bg: '#ECFDF5' },
      { label: 'Candidatures attente', value: this.stats.candidaturesEnAttente ?? 0, icon: 'pending', color: '#DC2626', bg: '#FEF2F2' },
    ];
  }

  // ── Flux pipeline ──
  get pipelineSteps(): any[] {
    if (!this.stats) return [];
    return [
      { label: 'Candidatures', value: this.stats.totalCandidatures ?? 0, icon: 'inbox', color: '#DC2626' },
      { label: 'Acceptées', value: this.stats.candidaturesAcceptees ?? 0, icon: 'check', color: '#F59E0B' },
      { label: 'Stages créés', value: this.stats.totalStages ?? 0, icon: 'work', color: '#1E40AF' },
      { label: 'En cours', value: this.stats.stagesEnCours ?? 0, icon: 'play_circle', color: '#00843D' },
      { label: 'Évalués', value: this.stats.totalEvaluations ?? 0, icon: 'star', color: '#7C3AED' },
      { label: 'Terminés', value: this.stats.stagesTermines ?? 0, icon: 'verified', color: '#059669' },
    ];
  }

  // ── Charts ──

  // Doughnut: statuts stages
  get statutsChartData(): ChartData<'doughnut'> {
    if (!this.stats) return { labels: [], datasets: [] };
    return {
      labels: ['En attente', 'En cours', 'Conv. générée', 'Conv. signée', 'En attente éval.', 'Terminés', 'Annulés'],
      datasets: [{
        data: [
          this.stats.stagesEnAttente ?? 0, this.stats.stagesEnCours ?? 0,
          this.stats.stagesConventionGeneree ?? 0, this.stats.stagesConventionSignee ?? 0,
          this.stats.stagesEnAttenteEvaluation ?? 0, this.stats.stagesTermines ?? 0,
          this.stats.stagesAnnules ?? 0
        ],
        backgroundColor: ['#F59E0B', '#00843D', '#7C3AED', '#0891B2', '#F47920', '#059669', '#DC2626'],
        borderWidth: 2, borderColor: '#ffffff'
      }]
    };
  }

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '60%',
    plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }
  };

  // Doughnut: candidatures
  get candidaturesChartData(): ChartData<'doughnut'> {
    if (!this.stats) return { labels: [], datasets: [] };
    return {
      labels: ['En attente', 'Acceptées', 'Refusées'],
      datasets: [{
        data: [this.stats.candidaturesEnAttente ?? 0, this.stats.candidaturesAcceptees ?? 0, this.stats.candidaturesRefusees ?? 0],
        backgroundColor: ['#F59E0B', '#00843D', '#DC2626'],
        borderWidth: 2, borderColor: '#ffffff'
      }]
    };
  }

  // Bar: départements
  get deptChartData(): ChartData<'bar'> {
    if (!this.stats?.stagesParDepartement) return { labels: [], datasets: [] };
    return {
      labels: this.stats.stagesParDepartement.map((d: any) => d[0] ?? 'N/A'),
      datasets: [{
        label: 'Total', data: this.stats.stagesParDepartement.map((d: any) => d[1] ?? 0),
        backgroundColor: '#00843D', borderRadius: 6, barThickness: 28
      }, {
        label: 'En cours', data: this.stats.stagesParDepartement.map((d: any) => d[2] ?? 0),
        backgroundColor: '#1E40AF', borderRadius: 6, barThickness: 28
      }, {
        label: 'Terminés', data: this.stats.stagesParDepartement.map((d: any) => d[3] ?? 0),
        backgroundColor: '#059669', borderRadius: 6, barThickness: 28
      }]
    };
  }

  deptChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, stacked: false, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
      y: { ticks: { font: { size: 11 } }, grid: { display: false } }
    },
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }
  };

  // Bar horizontal : stagiaires par école / établissement
  get ecoleChartData(): ChartData<'bar'> {
    if (!this.stats?.stagiairesParEcole) return { labels: [], datasets: [] };
    return {
      labels: this.stats.stagiairesParEcole.map((d: any) => d[0] ?? 'N/A'),
      datasets: [{
        label: 'Stagiaires', data: this.stats.stagiairesParEcole.map((d: any) => d[1] ?? 0),
        backgroundColor: '#7C3AED', borderRadius: 6, barThickness: 24
      }]
    };
  }

  get nombreEcoles(): number { return this.stats?.stagiairesParEcole?.length ?? 0; }

  // Bar: types de stages
  get typesChartData(): ChartData<'bar'> {
    if (!this.stats?.stagesParType) return { labels: [], datasets: [] };
    const typeLabels: Record<string, string> = {
      PFE: 'PFE', PFA: 'PFA', STAGE_ETE: 'Stage été',
      STAGE_OBSERVATION: 'Observation', STAGE_INITIATION: 'Initiation'
    };
    return {
      labels: this.stats.stagesParType.map((d: any) => typeLabels[d[0]] ?? d[0]),
      datasets: [{
        label: 'Stages', data: this.stats.stagesParType.map((d: any) => d[1] ?? 0),
        backgroundColor: ['#1E40AF', '#00843D', '#F47920', '#7C3AED', '#0891B2', '#D97706'],
        borderRadius: 6, barThickness: 36
      }]
    };
  }

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#f1f5f9' } },
      x: { ticks: { font: { size: 11 } }, grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  // Polar: performance
  get performanceChartData(): ChartData<'polarArea'> {
    if (!this.stats) return { labels: [], datasets: [] };
    const total = this.stats.totalStages || 1;
    return {
      labels: ['Taux acceptation', 'Moy. évaluations', 'Score IA', 'Taux complétion', 'Taux présence'],
      datasets: [{
        data: [
          this.stats.tauxAcceptation ?? 0,
          this.stats.moyenneEvaluations ? Math.round(this.stats.moyenneEvaluations / 20 * 100) : 0,
          this.stats.scoreMoyenMatching ?? 0,
          Math.round((this.stats.stagesTermines ?? 0) / total * 100),
          this.stats.tauxPresence ?? 85
        ],
        backgroundColor: [
          'rgba(0,132,61,0.6)', 'rgba(244,121,32,0.6)', 'rgba(124,58,237,0.6)',
          'rgba(30,64,175,0.6)', 'rgba(8,145,178,0.6)'
        ],
        borderColor: ['#00843D', '#F47920', '#7C3AED', '#1E40AF', '#0891B2'],
        borderWidth: 2
      }]
    };
  }

  polarOptions: ChartConfiguration<'polarArea'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: '#e2e8f0' } } },
    plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }
  };

  // ── Summary cards ──
  get summaryCards(): any[] {
    if (!this.stats) return [];
    return [
      { label: 'Stagiaires', value: this.stats.totalStagiaires ?? 0, icon: 'school', color: '#1E40AF' },
      { label: 'Encadrants', value: this.stats.totalEncadrants ?? 0, icon: 'supervisor_account', color: '#0891B2' },
      { label: 'Suivis', value: this.stats.totalSuivis ?? 0, icon: 'event_note', color: '#00843D' },
      { label: 'Annonces', value: this.stats.totalAnnonces ?? 0, icon: 'campaign', color: '#D97706' },
    ];
  }

  // ── Actions ──
  printReport(): void { window.print(); }

  refreshData(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/reporting/stats-completes`).subscribe({
      next: (data) => { this.stats = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  exportExcel(): void {
    if (!this.stats) return;
    const rows: any[] = [];
    this.kpis.forEach(k => rows.push({ Section: 'KPI', Indicateur: k.label, Valeur: k.value }));
    this.pipelineSteps.forEach(s => rows.push({ Section: 'Pipeline', Indicateur: s.label, Valeur: s.value }));
    (this.stats.stagesParDepartement ?? []).forEach((d: any) =>
      rows.push({ Section: 'Département', Indicateur: d[0] ?? 'N/A', Valeur: d[1] ?? 0, 'En cours': d[2] ?? 0, 'Terminés': d[3] ?? 0 })
    );
    this.exportService.exportGeneric(rows, 'reporting-ocp');
  }

  // ── Rapport PFE Bac+5 ──
  pfeBac5: any[] = [];
  pfeBac5Loading = false;
  pfeBac5Year: number | null = new Date().getFullYear();
  pfeBac5Dept = '';

  get pfeBac5Years(): number[] {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2, y - 3];
  }

  loadPfeBac5(): void {
    this.pfeBac5Loading = true;
    let url = `${environment.apiUrl}/reporting/pfe-bac5`;
    const params: string[] = [];
    if (this.pfeBac5Year) params.push(`annee=${this.pfeBac5Year}`);
    if (url && params.length) url += '?' + params.join('&');
    this.http.get<any[]>(url).subscribe({
      next: (data) => { this.pfeBac5 = data; this.pfeBac5Loading = false; },
      error: () => { this.pfeBac5 = []; this.pfeBac5Loading = false; }
    });
  }

  get filteredPfeBac5(): any[] {
    if (!this.pfeBac5Dept) return this.pfeBac5;
    return this.pfeBac5.filter(s => s.departement === this.pfeBac5Dept);
  }

  get pfeDepartements(): string[] {
    return [...new Set(this.pfeBac5.map((s: any) => s.departement).filter(Boolean))];
  }

  exportPfeBac5(): void {
    const rows = this.filteredPfeBac5.map(s => ({
      Nom: s.nom, Prénom: s.prenom, Établissement: s.etablissement,
      Département: s.departement, Sujet: s.sujet,
      'Date début': s.dateDebut, 'Date fin': s.dateFin,
      'Durée (mois)': s.dureeMois, Encadrant: s.encadrant, Statut: s.statut
    }));
    this.exportService.exportGeneric(rows, `rapport-pfe-bac5-${this.pfeBac5Year ?? 'all'}`);
  }
}
