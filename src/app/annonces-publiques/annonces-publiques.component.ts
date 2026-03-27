import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { AnnonceService } from '../core/services/annonce.service';
import { CandidatureService } from '../core/services/candidature.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-annonces-publiques',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressBarModule, MatSnackBarModule, MatChipsModule, MatStepperModule
  ],
  templateUrl: './annonces-publiques.component.html',
  styleUrls: ['./annonces-publiques.component.scss']
})
export class AnnoncesPubliquesComponent implements OnInit {
  annonces: any[] = [];
  filteredAnnonces: any[] = [];
  isLoading = true;
  selectedAnnonce: any = null;
  step: 'liste' | 'candidature' | 'success' = 'liste';
  isSubmitting = false;
  reference = '';
  searchKeyword = '';
  selectedCv: File | null = null;

  form: FormGroup;
  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+4', 'Bac+5'];

  constructor(
    private annonceService: AnnonceService,
    private candidatureService: CandidatureService,
    private fb: FormBuilder,
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
      message: ['']
    });
  }

  ngOnInit(): void { this.loadAnnonces(); }

  loadAnnonces(): void {
    this.isLoading = true;
    this.annonceService.getPubliques().subscribe({
      next: (data) => {
        this.annonces = data;
        this.filteredAnnonces = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void {
    const kw = this.searchKeyword.toLowerCase();
    this.filteredAnnonces = this.annonces.filter(a =>
      a.titre?.toLowerCase().includes(kw) ||
      a.departement?.toLowerCase().includes(kw) ||
      a.competencesRequises?.toLowerCase().includes(kw)
    );
  }

  postuler(annonce: any): void {
    this.selectedAnnonce = annonce;
    this.step = 'candidature';
    this.form.reset();
    this.selectedCv = null;
  }

  retourListe(): void {
    this.step = 'liste';
    this.selectedAnnonce = null;
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
    this.isSubmitting = true;
    const payload = {
      ...this.form.value,
      annonceId: this.selectedAnnonce.id,
      sujetSouhaite: this.selectedAnnonce.titre,
      departementSouhaite: this.selectedAnnonce.departement
    };
    this.candidatureService.soumettre(payload, this.selectedCv ?? undefined).subscribe({
      next: (data) => {
        this.reference = `CAND-${data.id}-2026`;
        this.step = 'success';
        this.isSubmitting = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors de la soumission', 'Fermer', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  recommencer(): void {
    this.step = 'liste';
    this.selectedAnnonce = null;
    this.form.reset();
    this.selectedCv = null;
  }
}