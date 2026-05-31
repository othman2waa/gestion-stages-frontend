import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { EvaluationService } from '../../core/services/evaluation.service';
import { StageService } from '../../core/services/stage.service';
import { EncadrantService } from '../../core/services/encadrant.service';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatCardModule
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
typesEval = ['MI_PARCOURS', 'FIN_STAGE'];
  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private stageService: StageService,
    private encadrantService: EncadrantService,
    private dialogRef: MatDialogRef<EvaluationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      stageId: ['', Validators.required],
      encadrantId: ['', Validators.required],
      note: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      commentaire: [''],
      typeEvaluation: ['', Validators.required],
      dateEval: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.stageService.getAll().subscribe(d => this.stages = d);
    this.encadrantService.getAll().subscribe(d => this.encadrants = d);

    // Quand on change le stage, on met à jour les infos
    this.form.get('stageId')?.valueChanges.subscribe(stageId => {
      this.selectedStage = this.stages.find(s => s.id === stageId) ?? null;
      // Pré-remplir l'encadrant automatiquement
      if (this.selectedStage?.encadrantId) {
        this.form.patchValue({ encadrantId: this.selectedStage.encadrantId }, { emitEvent: false });
      }
    });

    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        ...this.data,
        stageId: this.data.stageId,
        encadrantId: this.data.encadrantId
      });
      this.selectedStage = { 
        stagiaireNom: this.data.stagiaireNom,
        sujet: this.data.stageSujet 
      };
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const payload = {
      ...this.form.value,
      dateEval: this.form.value.dateEval instanceof Date
        ? this.form.value.dateEval.toISOString().split('T')[0]
        : this.form.value.dateEval
    };
    const request = this.isEdit
      ? this.evaluationService.update(this.data.id, payload)
      : this.evaluationService.create(payload);
    request.subscribe({
      next: () => { this.isLoading = false; this.dialogRef.close(true); },
      error: () => { this.isLoading = false; }
    });
  }

  onCancel(): void { this.dialogRef.close(false); }
}