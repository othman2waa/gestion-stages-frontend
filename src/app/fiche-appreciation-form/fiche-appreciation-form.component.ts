import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FicheAppreciationService } from '../core/services/fiche-appreciation.service';

export interface FicheDialogData {
  stageId: number;
  stagiaireNom: string;
  type: 'STAGE' | 'STAGIAIRE';
  existing?: any;
}

interface Critere {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-fiche-appreciation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './fiche-appreciation-form.component.html',
  styleUrls: ['./fiche-appreciation-form.component.scss']
})
export class FicheAppreciationFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;

  get isStage(): boolean { return this.data.type === 'STAGE'; }

  criteresStage: Critere[] = [
    { key: 'noteGlobale', label: 'Note globale', icon: 'star' },
    { key: 'qualiteTravail', label: 'Qualité du travail', icon: 'work' },
    { key: 'respectDelais', label: 'Respect des délais', icon: 'schedule' },
    { key: 'initiative', label: 'Initiative', icon: 'lightbulb' },
    { key: 'qualiteRapport', label: 'Qualité du rapport', icon: 'description' },
    { key: 'competencesTechniques', label: 'Compétences techniques', icon: 'code' }
  ];

  criteresStagiaire: Critere[] = [
    { key: 'assiduite', label: 'Assiduité', icon: 'event_available' },
    { key: 'ponctualite', label: 'Ponctualité', icon: 'schedule' },
    { key: 'comportementProfessionnel', label: 'Comportement professionnel', icon: 'business_center' },
    { key: 'espritEquipe', label: 'Esprit d\'équipe', icon: 'group' },
    { key: 'communication', label: 'Communication', icon: 'forum' },
    { key: 'adaptation', label: 'Adaptation', icon: 'autorenew' }
  ];

  recommandations = [
    { value: 'TRES_FAVORABLE', label: 'Très favorable' },
    { value: 'FAVORABLE', label: 'Favorable' },
    { value: 'RESERVE', label: 'Réservé' },
    { value: 'DEFAVORABLE', label: 'Défavorable' }
  ];

  recommandationsEmbauche = [
    { value: 'OUI', label: 'Oui' },
    { value: 'PEUT_ETRE', label: 'Peut-être' },
    { value: 'NON', label: 'Non' }
  ];

  notes = [1, 2, 3, 4, 5];
  noteLabels: Record<number, string> = {
    1: 'Insuffisant', 2: 'Passable', 3: 'Bien', 4: 'Très bien', 5: 'Excellent'
  };

  get criteres(): Critere[] {
    return this.isStage ? this.criteresStage : this.criteresStagiaire;
  }

  get moyennePreview(): number {
    const vals = this.criteres.map(c => this.form.get(c.key)?.value ?? 0).filter(v => v > 0);
    if (vals.length === 0) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }

  constructor(
    private fb: FormBuilder,
    private ficheService: FicheAppreciationService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<FicheAppreciationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FicheDialogData
  ) {
    const controls: Record<string, any> = { commentaires: [''] };

    if (data.type === 'STAGE') {
      this.criteresStage.forEach(c => controls[c.key] = [null, [Validators.required, Validators.min(1), Validators.max(5)]]);
      controls['recommandation'] = ['', Validators.required];
    } else {
      this.criteresStagiaire.forEach(c => controls[c.key] = [null, [Validators.required, Validators.min(1), Validators.max(5)]]);
      controls['recommandationEmbauche'] = ['', Validators.required];
    }

    this.form = this.fb.group(controls);
  }

  ngOnInit(): void {
    if (this.data.existing) {
      this.isEdit = true;
      this.form.patchValue(this.data.existing);
    }
  }

  setNote(critereKey: string, value: number): void {
    this.form.get(critereKey)?.setValue(value);
  }

  getNoteValue(critereKey: string): number {
    return this.form.get(critereKey)?.value ?? 0;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;

    const payload = { ...this.form.value, stageId: this.data.stageId };

    const request$: Observable<any> = this.isStage
      ? (this.isEdit
        ? this.ficheService.updateFicheStage(this.data.existing.id, payload)
        : this.ficheService.createFicheStage(payload))
      : (this.isEdit
        ? this.ficheService.updateFicheStagiaire(this.data.existing.id, payload)
        : this.ficheService.createFicheStagiaire(payload));

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Fiche enregistrée avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
      }
    });
  }

  getMoyenneClass(): string {
    const m = this.moyennePreview;
    if (m >= 4) return 'moy-excellent';
    if (m >= 3) return 'moy-bien';
    if (m >= 2) return 'moy-passable';
    return 'moy-insuffisant';
  }

  onCancel(): void { this.dialogRef.close(false); }
}
