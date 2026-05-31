import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-portail-candidature',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatStepperModule,
    MatSnackBarModule, MatProgressBarModule
  ],
  templateUrl: './portail-candidature.component.html',
  styleUrls: ['./portail-candidature.component.scss']
})
export class PortailCandidatureComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  isSubmitting = false;
  submitted = false;
  cvFile: File | null = null;
  departements: any[] = [];
  specialites: string[] = [];

  readonly niveaux    = ['Bac+2', 'Bac+3', 'Bac+5', 'Ingénieur', 'Master'];
  readonly typeStages = ['PFE', 'PFA', 'Stage été', 'Stage observation'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.step1Form = this.fb.group({
      prenom:        ['', [Validators.required, Validators.minLength(2)]],
      nom:           ['', [Validators.required, Validators.minLength(2)]],
      email:         ['', [Validators.required, Validators.email]],
      telephone:     ['', Validators.required],
      filiere:       ['', Validators.required],
      niveau:        ['', Validators.required],
      etablissement: ['', Validators.required],
    });

    this.step2Form = this.fb.group({
      departementId: [null, Validators.required],
      specialite:    ['',   Validators.required],
      sujetSouhaite: ['',   Validators.required],
      typeStage:     ['PFE', Validators.required],
      message:       [''],
    });

    this.http.get<any[]>(`${environment.apiUrl}/departements/actifs`).subscribe({
      next: (d) => { this.departements = d; }
    });
  }

onDepartementChange(departementId: any): void {
  this.specialites = [];
  this.step2Form.patchValue({ specialite: '' });
  const id = Number(departementId);
  if (!id) return;
  this.http.get<string[]>(`${environment.apiUrl}/departements/${id}/specialites`)
    .subscribe({
      next: (s) => { this.specialites = s; },
      error: () => { this.specialites = []; }
    });
}

  onCvSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.cvFile = file;
    } else {
      this.snackBar.open('❌ Veuillez sélectionner un fichier PDF', 'Fermer', { duration: 3000 });
    }
  }

  soumettre(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) return;
    this.isSubmitting = true;
    const data = { ...this.step1Form.value, ...this.step2Form.value };
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (this.cvFile) formData.append('cv', this.cvFile);
    this.http.post(`${environment.apiUrl}/candidatures`, formData).subscribe({
      next: () => { this.submitted = true; this.isSubmitting = false; },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || '❌ Erreur', 'Fermer', { duration: 4000 });
      }
    });
  }
}