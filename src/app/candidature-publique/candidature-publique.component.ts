import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { CandidatureService } from '../core/services/candidature.service';

@Component({
  selector: 'app-candidature-publique',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatProgressBarModule, MatSnackBarModule, MatChipsModule
  ],
  templateUrl: './candidature-publique.component.html',
  styleUrls: ['./candidature-publique.component.scss']
})
export class CandidaturePubliqueComponent {
  step: 'form' | 'success' = 'form';
  isLoading = false;
  selectedCv: File | null = null;
  reference = '';

  form: FormGroup;

  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat'];
  readonly typesStage = ['PFE', 'PFA', 'Stage Été', 'Stage Observation'];
  readonly departements = [
    'Informatique', 'Finance', 'Ressources Humaines',
    'Production', 'Logistique', 'Marketing', 'Juridique', 'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private candidatureService: CandidatureService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      etablissement: ['', Validators.required],
      filiere: ['', Validators.required],
      niveau: ['', Validators.required],
      sujetSouhaite: [''],
      departementSouhaite: [''],
      message: ['']
    });
  }

  onCvSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.snackBar.open('Seuls les PDF sont acceptés', 'Fermer', { duration: 3000 });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Fichier trop volumineux (max 5MB)', 'Fermer', { duration: 3000 });
      return;
    }
    this.selectedCv = file;
  }

  soumettre(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.candidatureService.soumettre(this.form.value, this.selectedCv ?? undefined).subscribe({
      next: (data) => {
        this.reference = `CAND-${data.id}-2026`;
        this.step = 'success';
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors de la soumission', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  recommencer(): void {
    this.step = 'form';
    this.form.reset();
    this.selectedCv = null;
  }
}