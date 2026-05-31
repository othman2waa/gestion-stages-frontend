import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConventionService } from '../../core/services/convention.service';
import { StageService } from '../../core/services/stage.service';

@Component({
  selector: 'app-convention-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatAutocompleteModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
  ],
  templateUrl: './convention-form.component.html',
  styleUrls: ['./convention-form.component.scss']
})
export class ConventionFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  stages: any[] = [];
  statuts = ['BROUILLON', 'EN_VALIDATION', 'SIGNEE', 'ARCHIVEE'];

  // Autocomplete
  stageSearchCtrl = new FormControl('');
  filteredStages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private conventionService: ConventionService,
    private stageService: StageService,
    private dialogRef: MatDialogRef<ConventionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      stageId: ['', Validators.required],
      numero: ['', Validators.required],
      statut: ['BROUILLON'],
      dateEmission: [new Date()]
    });
  }

  ngOnInit(): void {
    this.stageService.getAll().subscribe(d => {
      this.stages = d;
      this.filteredStages = d;
    });

    // Filtrage en temps réel
    this.stageSearchCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.filterStages(value || '');
    });

    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({ ...this.data, stageId: this.data.stageId });
    } else {
      this.form.patchValue({ numero: this.genererNumero() });
    }
  }

  filterStages(value: string): void {
    const filter = value.toLowerCase();
    this.filteredStages = this.stages.filter(s =>
      `${s.sujet} ${s.stagiaireNom} ${s.departementNom} ${s.encadrantNom}`
        .toLowerCase().includes(filter)
    );
  }

  onStageSelected(stage: any): void {
    this.form.patchValue({ stageId: stage.id });
    this.stageSearchCtrl.setValue(`${stage.sujet} — ${stage.stagiaireNom}`, { emitEvent: false });
  }

  displayStage = (stage: any): string => {
    return stage ? `${stage.sujet} — ${stage.stagiaireNom}` : '';
  };

  genererNumero(): string {
    const annee = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 900);
    return `CONV-${annee}-${random}`;
  }

  get selectedStage(): any {
    return this.stages.find(s => s.id === this.form.get('stageId')?.value);
  }

  get dureeJours(): number {
    const s = this.selectedStage;
    if (!s?.dateDebut || !s?.dateFin) return 0;
    const debut = new Date(s.dateDebut);
    const fin = new Date(s.dateFin);
    return Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const request = this.isEdit
      ? this.conventionService.update(this.data.id, this.form.value)
      : this.conventionService.create(this.form.value);
    request.subscribe({
      next: () => { this.isLoading = false; this.dialogRef.close(true); },
      error: () => { this.isLoading = false; }
    });
  }

  onCancel(): void { this.dialogRef.close(false); }
}
