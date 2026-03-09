import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { OnboardingService } from '../core/services/onboarding.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatStepperModule, MatChipsModule
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  step: 'upload' | 'review' | 'success' = 'upload';
  isLoading = false;
  selectedFile: File | null = null;
  infosExtraites: any = null;
  resultatCreation: any = null;

  constructor(
    private onboardingService: OnboardingService,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      this.snackBar.open('Veuillez sélectionner un fichier PDF', 'Fermer', { duration: 3000 });
    }
  }

  analyserCV(): void {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.onboardingService.analyserCV(this.selectedFile).subscribe({
      next: (data) => {
        this.infosExtraites = data;
        this.step = 'review';
        this.isLoading = false;
      },
      error: (e) => {
        this.snackBar.open('Erreur lors de l\'analyse: ' + (e.error?.error || e.message), 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  confirmerEtCreer(): void {
    this.isLoading = true;
    this.onboardingService.creerCompte(this.infosExtraites).subscribe({
      next: (data) => {
        this.resultatCreation = data;
        this.step = 'success';
        this.isLoading = false;
      },
      error: (e) => {
        this.snackBar.open('Erreur: ' + (e.error?.error || e.message), 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  recommencer(): void {
    this.step = 'upload';
    this.selectedFile = null;
    this.infosExtraites = null;
    this.resultatCreation = null;
  }
}