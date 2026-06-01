import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  userRole = '';
  readonly today = new Date();
  private apiBase = `${environment.apiUrl}/reporting`;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  get isAdmin(): boolean {
    return ['ADMIN_RH', 'RESPONSABLE_RH'].includes(this.userRole);
  }

  get statutsList(): any[] {
    if (!this.stats) return [];
    const total = this.stats.totalStages || 1;
    return [
      { label:'En attente',          value: this.stats.stagesEnAttente ?? 0,            color:'#F59E0B', icon:'hourglass_empty',  pct: Math.round((this.stats.stagesEnAttente ?? 0) / total * 100) },
      { label:'En cours',            value: this.stats.stagesEnCours ?? 0,              color:'#00843D', icon:'play_circle',       pct: Math.round((this.stats.stagesEnCours ?? 0) / total * 100) },
      { label:'Convention générée',  value: this.stats.stagesConventionGeneree ?? 0,    color:'#7C3AED', icon:'description',       pct: Math.round((this.stats.stagesConventionGeneree ?? 0) / total * 100) },
      { label:'Convention signée',   value: this.stats.stagesConventionSignee ?? 0,     color:'#0891B2', icon:'draw',              pct: Math.round((this.stats.stagesConventionSignee ?? 0) / total * 100) },
      { label:'En attente éval.',    value: this.stats.stagesEnAttenteEvaluation ?? 0,  color:'#F47920', icon:'star_rate',         pct: Math.round((this.stats.stagesEnAttenteEvaluation ?? 0) / total * 100) },
      { label:'Terminés',            value: this.stats.stagesTermines ?? 0,             color:'#059669', icon:'check_circle',      pct: Math.round((this.stats.stagesTermines ?? 0) / total * 100) },
      { label:'Annulés',             value: this.stats.stagesAnnules ?? 0,              color:'#DC2626', icon:'cancel',            pct: Math.round((this.stats.stagesAnnules ?? 0) / total * 100) },
    ];
  }

  get candidaturesDonut(): any[] {
    if (!this.stats) return [];
    const total = (this.stats.candidaturesEnAttente ?? 0) +
                  (this.stats.candidaturesAcceptees ?? 0) +
                  (this.stats.candidaturesRefusees ?? 0) || 1;
    return [
      { label:'En attente', value: this.stats.candidaturesEnAttente ?? 0, color:'#F59E0B', pct: Math.round((this.stats.candidaturesEnAttente ?? 0) / total * 100) },
      { label:'Acceptées',  value: this.stats.candidaturesAcceptees ?? 0, color:'#00843D', pct: Math.round((this.stats.candidaturesAcceptees ?? 0) / total * 100) },
      { label:'Refusées',   value: this.stats.candidaturesRefusees ?? 0,  color:'#DC2626', pct: Math.round((this.stats.candidaturesRefusees ?? 0) / total * 100) },
    ];
  }

  get topKpis(): any[] {
    if (!this.stats) return [];
    return [
      { label:'Stagiaires',   value: this.stats.totalStagiaires,  icon:'school',            color:'#1E40AF' },
      { label:'Stages',       value: this.stats.totalStages,      icon:'work',              color:'#00843D' },
      { label:'En cours',     value: this.stats.stagesEnCours,    icon:'play_circle',       color:'#059669' },
      { label:'Conventions',  value: this.stats.totalConventions, icon:'description',       color:'#F47920' },
      { label:'Évaluations',  value: this.stats.totalEvaluations, icon:'star_rate',         color:'#7C3AED' },
      { label:'Encadrants',   value: this.stats.totalEncadrants,  icon:'supervisor_account',color:'#0891B2' },
      { label:'Candidatures', value: this.stats.totalCandidatures,icon:'inbox',             color:'#DC2626' },
      { label:'Annonces',     value: this.stats.totalAnnonces,    icon:'campaign',          color:'#D97706' },
    ];
  }

  get alertes(): any[] {
    if (!this.stats) return [];
    const items = [];
    if ((this.stats.candidaturesEnAttente ?? 0) > 0)
      items.push({ icon:'person_add',         color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', label:'Candidature(s) à traiter',  val: this.stats.candidaturesEnAttente, route:'/candidatures' });
    if ((this.stats.stagesEnAttenteEvaluation ?? 0) > 0)
      items.push({ icon:'star_rate',          color:'#F47920', bg:'#FFF7ED', border:'#FED7AA', label:'Stage(s) à évaluer',         val: this.stats.stagesEnAttenteEvaluation, route:'/evaluations' });
    if ((this.stats.attestationsEnAttente ?? 0) > 0)
      items.push({ icon:'workspace_premium',  color:'#1E40AF', bg:'#EFF6FF', border:'#BFDBFE', label:'Attestation(s) en attente',  val: this.stats.attestationsEnAttente, route:'/attestations' });
    if (items.length === 0)
      items.push({ icon:'check_circle',       color:'#00843D', bg:'#F0FDF4', border:'#BBF7D0', label:'Tout est à jour !',          val:'✓', route:'' });
    return items;
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    if (this.userRole === 'ENCADRANT') {
      this.router.navigate(['/encadrant-dashboard']);
      return;
    }
    if (this.isAdmin) {
      this.http.get<any>(`${this.apiBase}/stats-completes`).subscribe({
        next: (data) => { this.stats = data; this.isLoading = false; },
        error: () => this.isLoading = false
      });
    }
  }

  navigate(route: string): void {
    if (route) this.router.navigate([route]);
  }
}