import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowService, StageHistorique } from '../../core/services/workflow.service';

@Component({
  selector: 'app-stage-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stage-detail.component.html',
  styleUrls: ['./stage-detail.component.scss']
})
export class StageDetailComponent implements OnInit {
  stageId!: number;
  historique: StageHistorique[] = [];
  transitionsPossibles: string[] = [];
  commentaire = '';
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  statutLabels: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    DEMANDE_SOUMISE: 'Demande soumise',
    EN_ATTENTE_VALIDATION: 'En attente de validation',
    VALIDEE: 'Validée',
    REJETEE: 'Rejetée',
    CONVENTION_GENEREE: 'Convention générée',
    CONVENTION_SIGNEE: 'Convention signée',
    EN_COURS: 'En cours',
    EN_ATTENTE_EVALUATION: 'En attente d\'évaluation',
    TERMINE: 'Terminé',
    ANNULE: 'Annulé'
  };

  statutColors: Record<string, string> = {
    EN_ATTENTE: '#94a3b8',
    DEMANDE_SOUMISE: '#60a5fa',
    EN_ATTENTE_VALIDATION: '#f59e0b',
    VALIDEE: '#34d399',
    REJETEE: '#f87171',
    CONVENTION_GENEREE: '#a78bfa',
    CONVENTION_SIGNEE: '#818cf8',
    EN_COURS: '#2dd4bf',
    EN_ATTENTE_EVALUATION: '#fb923c',
    TERMINE: '#4ade80',
    ANNULE: '#9ca3af'
  };

  constructor(
    private route: ActivatedRoute,
    private workflowService: WorkflowService
  ) {}

  ngOnInit(): void {
    this.stageId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.workflowService.getHistorique(this.stageId).subscribe({
      next: (h) => this.historique = h,
      error: (e) => console.error(e)
    });
    this.workflowService.getTransitionsPossibles(this.stageId).subscribe({
      next: (t) => this.transitionsPossibles = t,
      error: (e) => console.error(e)
    });
  }

  effectuerTransition(statut: string): void {
    this.loading = true;
    this.workflowService.transitionner(this.stageId, {
      nouveauStatut: statut,
      commentaire: this.commentaire
    }).subscribe({
      next: () => {
        this.message = `Transition vers "${this.statutLabels[statut]}" effectuée avec succès !`;
        this.messageType = 'success';
        this.commentaire = '';
        this.loadData();
        this.loading = false;
      },
      error: (e) => {
        this.message = e.error?.message || 'Erreur lors de la transition';
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  getLabel(statut: string): string {
    return this.statutLabels[statut] || statut;
  }

  getColor(statut: string): string {
    return this.statutColors[statut] || '#94a3b8';
  }

  getCurrentStatut(): string {
    return this.historique.length > 0 ? this.historique[0].statutNouveau : '';
  }
}