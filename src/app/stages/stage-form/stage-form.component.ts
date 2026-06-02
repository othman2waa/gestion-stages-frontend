import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { StageService } from '../../core/services/stage.service';
import { StagiaireService } from '../../core/services/stagiaire.service';
import { EncadrantService } from '../../core/services/encadrant.service';
import { DepartementService } from '../../core/services/departement.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-stage-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatAutocompleteModule
  ],
  templateUrl: './stage-form.component.html',
  styleUrls: ['./stage-form.component.scss']
})
export class StageFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  userRole = '';
  stagiaires: any[] = [];
  encadrants: any[] = [];
  departements: any[] = [];

  // Autocomplete search
  stagiaireSearch = '';
  encadrantSearch = '';

  get filteredStagiaires(): any[] {
    if (!this.stagiaireSearch) return this.stagiaires;
    const kw = this.stagiaireSearch.toLowerCase();
    return this.stagiaires.filter(s =>
      `${s.nom} ${s.prenom} ${s.filiere ?? ''} ${s.cin ?? ''}`.toLowerCase().includes(kw)
    );
  }

  get filteredEncadrants(): any[] {
    if (!this.encadrantSearch) return this.encadrants;
    const kw = this.encadrantSearch.toLowerCase();
    return this.encadrants.filter(e =>
      `${e.nom} ${e.prenom}`.toLowerCase().includes(kw)
    );
  }

  typeStages = [
    { value: 'PFE', label: 'Projet de Fin d\'Études' },
    { value: 'PFA', label: 'Projet de Fin d\'Année' },
    { value: 'STAGE_ETE', label: 'Stage d\'été' },
    { value: 'STAGE_OBSERVATION', label: 'Stage d\'observation' }
  ];

  statuts = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' }
  ];

  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }

  constructor(
    private fb: FormBuilder,
    private stageService: StageService,
    private stagiaireService: StagiaireService,
    private encadrantService: EncadrantService,
    private deptService: DepartementService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<StageFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      stagiaireId: [null, Validators.required],
      encadrantId: [null],
      departementId: [null],
      sujet: ['', Validators.required],
      description: [''],
      objectifs: [''],
      typeStage: ['', Validators.required],
      statut: ['EN_ATTENTE'],
      dateDebut: [null, Validators.required],
      dateFin: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';

    // Load dropdowns
    if (this.isEncadrant) {
      this.stagiaireService.getMesStagiaires().subscribe(d => {
        this.stagiaires = d;
        this.initSearchText();
      });
    } else {
      this.stagiaireService.getAll().subscribe(d => {
        this.stagiaires = d;
        this.initSearchText();
      });
      this.encadrantService.getAll().subscribe(d => {
        this.encadrants = d;
        this.initEncadrantSearchText();
      });
    }
    this.deptService.getActifs().subscribe(d => this.departements = d);

    // Edit mode
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        stagiaireId: this.data.stagiaireId,
        encadrantId: this.data.encadrantId,
        departementId: this.data.departementId ?? null,
        sujet: this.data.sujet,
        description: this.data.description ?? '',
        objectifs: this.data.objectifs ?? '',
        typeStage: this.data.typeStage,
        statut: this.data.statut,
        dateDebut: this.data.dateDebut ? new Date(this.data.dateDebut) : null,
        dateFin: this.data.dateFin ? new Date(this.data.dateFin) : null
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;

    const payload = { ...this.form.value };

    // Format dates to yyyy-MM-dd
    if (payload.dateDebut instanceof Date) {
      payload.dateDebut = this.formatDate(payload.dateDebut);
    }
    if (payload.dateFin instanceof Date) {
      payload.dateFin = this.formatDate(payload.dateFin);
    }

    const request = this.isEdit
      ? this.stageService.update(this.data.id, payload)
      : this.stageService.create(payload);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(this.isEdit ? 'Stage modifié' : 'Stage créé', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }

  onCancel(): void { this.dialogRef.close(false); }

  selectStagiaire(s: any): void {
    this.form.patchValue({ stagiaireId: s.id });
    this.stagiaireSearch = `${s.nom} ${s.prenom}`;
  }

  selectEncadrant(e: any): void {
    if (!e) {
      this.clearEncadrant();
      return;
    }
    this.form.patchValue({ encadrantId: e.id });
    this.encadrantSearch = `${e.nom} ${e.prenom}`;
  }

  clearStagiaire(): void {
    this.form.patchValue({ stagiaireId: null });
    this.stagiaireSearch = '';
  }

  clearEncadrant(): void {
    this.form.patchValue({ encadrantId: null });
    this.encadrantSearch = '';
  }

  get selectedStagiaireName(): string {
    const id = this.form.get('stagiaireId')?.value;
    const s = this.stagiaires.find(x => x.id === id);
    return s ? `${s.nom} ${s.prenom}` : '';
  }

  get selectedEncadrantName(): string {
    const id = this.form.get('encadrantId')?.value;
    const e = this.encadrants.find(x => x.id === id);
    return e ? `${e.nom} ${e.prenom}` : '';
  }

  private initSearchText(): void {
    if (this.data?.stagiaireId) {
      const s = this.stagiaires.find(x => x.id === this.data.stagiaireId);
      if (s) this.stagiaireSearch = `${s.nom} ${s.prenom}`;
    }
  }

  private initEncadrantSearchText(): void {
    if (this.data?.encadrantId) {
      const e = this.encadrants.find(x => x.id === this.data.encadrantId);
      if (e) this.encadrantSearch = `${e.nom} ${e.prenom}`;
    }
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
