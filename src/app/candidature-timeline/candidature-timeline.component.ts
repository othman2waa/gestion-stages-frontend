import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface TimelineStep {
  statut: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-candidature-timeline',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatTooltipModule, MatSnackBarModule
  ],
  templateUrl: './candidature-timeline.component.html',
  styleUrls: ['./candidature-timeline.component.scss']
})
export class CandidatureTimelineComponent implements OnInit {
  @Input() profil: any = null;

  private api = `${environment.apiUrl}/candidatures`;

  readonly steps: TimelineStep[] = [
    {
      statut: 'EN_ATTENTE',
      label: 'Candidature soumise',
      description: 'Votre candidature a été reçue et est en attente d\'examen par un encadrant.',
      icon: 'send',
      color: '#64748B'
    },
    {
      statut: 'MEETING_PLANIFIE',
      label: 'Meeting planifié',
      description: 'Un encadrant a planifié un entretien avec vous.',
      icon: 'event',
      color: '#0891B2'
    },
    {
      statut: 'ACCEPTEE_ENCADRANT',
      label: 'Accepté par l\'encadrant',
      description: 'Félicitations ! Votre candidature a été acceptée. Uploadez vos documents.',
      icon: 'how_to_reg',
      color: '#7C3AED'
    },
    {
      statut: 'DOCUMENTS_SOUMIS',
      label: 'Documents soumis',
      description: 'Vos documents ont été envoyés au service RH pour vérification.',
      icon: 'upload_file',
      color: '#0891B2'
    },
    {
      statut: 'VERIFICATION_IA',
      label: 'Vérification en cours',
      description: 'Le service RH vérifie vos documents.',
      icon: 'psychology',
      color: '#7C3AED'
    },
    {
      statut: 'ACCEPTEE_RH',
      label: 'Dossier validé',
      description: 'Votre dossier a été validé ! Vous allez recevoir votre convocation.',
      icon: 'verified',
      color: '#00843D'
    },
  ];

  readonly refusStatuts = ['REFUSEE_ENCADRANT', 'REFUSEE_RH'];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  get currentStatut(): string {
    return this.profil?.candidatureStatut ?? 'EN_ATTENTE';
  }

  get isRefused(): boolean {
    return this.refusStatuts.includes(this.currentStatut);
  }

  get currentStepIndex(): number {
    return this.steps.findIndex(s => s.statut === this.currentStatut);
  }

  get progressPercent(): number {
    if (this.isRefused) return 0;
    const idx = this.currentStepIndex;
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / this.steps.length) * 100);
  }

  isCompleted(step: TimelineStep): boolean {
    const currentIdx = this.currentStepIndex;
    const stepIdx = this.steps.findIndex(s => s.statut === step.statut);
    return stepIdx < currentIdx;
  }

  isCurrent(step: TimelineStep): boolean {
    return step.statut === this.currentStatut;
  }

  getStepState(step: TimelineStep): 'completed' | 'current' | 'pending' {
    if (this.isCompleted(step)) return 'completed';
    if (this.isCurrent(step)) return 'current';
    return 'pending';
  }

  getCurrentStep(): TimelineStep | null {
    return this.steps.find(s => s.statut === this.currentStatut) ?? null;
  }

  getStatutLabel(): string {
    const map: Record<string, string> = {
      EN_ATTENTE:          'En attente d\'examen',
      MEETING_PLANIFIE:    'Meeting planifié',
      ACCEPTEE_ENCADRANT:  'Accepté — Upload documents requis',
      DOCUMENTS_SOUMIS:    'Documents envoyés',
      VERIFICATION_IA:     'Vérification en cours',
      ACCEPTEE_RH:         'Dossier validé ✅',
      REFUSEE_ENCADRANT:   'Candidature refusée',
      REFUSEE_RH:          'Dossier refusé',
    };
    return map[this.currentStatut] ?? this.currentStatut;
  }

  getStatutColor(): string {
    if (this.isRefused) return '#DC2626';
    return this.getCurrentStep()?.color ?? '#64748B';
  }
}