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
import { EvaluationService } from '../../core/services/evaluation.service';
import { StageService } from '../../core/services/stage.service';
import { EncadrantService } from '../../core/services/encadrant.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatAutocompleteModule
  ],
  templateUrl: './evaluation-form.component.html',
  styleUrls: ['./evaluation-form.component.scss']
})
export class EvaluationFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  stages: any[] = [];
  encadrants: any[] = [];
  selectedStage: any = null;
  userRole = '';
  stageSearch = '';

  get filteredStages(): any[] {
    if (!this.stageSearch) return this.stages;
    const kw = this.stageSearch.toLowerCase();
    return this.stages.filter(s =>
      `${s.sujet} ${s.stagiairePrenom ?? ''} ${s.stagiaireNom ?? ''} ${s.stagiaireFiliere ?? ''}`.toLowerCase().includes(kw)
    );
  }

  typesEval = [
    { value: 'MI_PARCOURS', label: 'Mi-parcours' },
    { value: 'FIN_STAGE', label: 'Fin de stage' }
  ];

  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }

  get notePreview(): number { return this.form.get('note')?.value ?? 0; }

  get noteClass(): string {
    const n = this.notePreview;
    if (n >= 16) return 'note-excellent';
    if (n >= 12) return 'note-bien';
    if (n >= 10) return 'note-passable';
    return 'note-insuffisant';
  }

  get noteLabel(): string {
    const n = this.notePreview;
    if (n >= 16) return 'Excellent';
    if (n >= 12) return 'Bien';
    if (n >= 10) return 'Passable';
    return 'Insuffisant';
  }

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private stageService: StageService,
    private encadrantService: EncadrantService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EvaluationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      stageId: [null, Validators.required],
      encadrantId: [null, Validators.required],
      note: [null, [Validators.required, Validators.min(0), Validators.max(20)]],
      commentaire: [''],
      typeEvaluation: ['', Validators.required],
      dateEval: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';

    // Load stages based on role
    if (this.isEncadrant) {
      this.stageService.getMesStages().subscribe(d => {
        this.stages = d;
        this.initEditStage();
      });
    } else {
      this.stageService.getAll().subscribe(d => {
        this.stages = d;
        this.initEditStage();
      });
      this.encadrantService.getAll().subscribe(d => this.encadrants = d);
    }

    // Edit mode
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        stageId: this.data.stageId,
        encadrantId: this.data.encadrantId,
        note: this.data.note,
        commentaire: this.data.commentaire,
        typeEvaluation: this.data.typeEvaluation,
        dateEval: this.data.dateEval ? new Date(this.data.dateEval) : new Date()
      });
      this.selectedStage = {
        stagiaireNom: this.data.stagiaireNom,
        stagiaireFiliere: this.data.stagiaireFiliere,
        sujet: this.data.stageSujet
      };
    }
  }

  private initEditStage(): void {
    if (this.data?.stageId) {
      const s = this.stages.find(x => x.id === this.data.stageId);
      if (s) {
        this.selectedStage = s;
        this.stageSearch = `${s.sujet} — ${s.stagiairePrenom ?? ''} ${s.stagiaireNom ?? ''}`;
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;

    const payload = { ...this.form.value };
    if (payload.dateEval instanceof Date) {
      const y = payload.dateEval.getFullYear();
      const m = String(payload.dateEval.getMonth() + 1).padStart(2, '0');
      const d = String(payload.dateEval.getDate()).padStart(2, '0');
      payload.dateEval = `${y}-${m}-${d}`;
    }

    const request = this.isEdit
      ? this.evaluationService.update(this.data.id, payload)
      : this.evaluationService.create(payload);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(this.isEdit ? 'Évaluation modifiée' : 'Évaluation créée', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }

  selectStage(stage: any): void {
    this.form.patchValue({ stageId: stage.id });
    this.stageSearch = `${stage.sujet} — ${stage.stagiairePrenom ?? ''} ${stage.stagiaireNom ?? ''}`;
    this.selectedStage = stage;
    if (stage.encadrantId) {
      this.form.patchValue({ encadrantId: stage.encadrantId }, { emitEvent: false });
    }
  }

  clearStage(): void {
    this.form.patchValue({ stageId: null, encadrantId: null });
    this.stageSearch = '';
    this.selectedStage = null;
  }

  onCancel(): void { this.dialogRef.close(false); }
}
