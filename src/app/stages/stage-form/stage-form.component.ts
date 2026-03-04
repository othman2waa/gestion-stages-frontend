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
import { StageService } from '../../core/services/stage.service';
import { StagiaireService } from '../../core/services/stagiaire.service';
import { EncadrantService } from '../../core/services/encadrant.service';

@Component({
  selector: 'app-stage-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule
  ],
  templateUrl: './stage-form.component.html',
  styleUrls: ['./stage-form.component.scss']
})
export class StageFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  stagiaires: any[] = [];
  encadrants: any[] = [];

  typeStages = ['PFE', 'PFA', 'STAGE_ETE', 'STAGE_OBSERVATION'];
  statuts = ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ANNULE'];

  constructor(
    private fb: FormBuilder,
    private stageService: StageService,
    private stagiaireService: StagiaireService,
    private encadrantService: EncadrantService,
    private dialogRef: MatDialogRef<StageFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      stagiaireId: ['', Validators.required],
      encadrantId: [''],
      sujet: ['', Validators.required],
      typeStage: ['', Validators.required],
      statut: ['EN_ATTENTE'],
      dateDebut: [''],
      dateFin: ['']
    });
  }

  ngOnInit(): void {
    this.stagiaireService.getAll().subscribe(d => this.stagiaires = d);
    this.encadrantService.getAll().subscribe(d => this.encadrants = d);
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        ...this.data,
        stagiaireId: this.data.stagiaireId,
        encadrantId: this.data.encadrantId
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const request = this.isEdit
      ? this.stageService.update(this.data.id, this.form.value)
      : this.stageService.create(this.form.value);
    request.subscribe({
      next: () => { this.isLoading = false; this.dialogRef.close(true); },
      error: () => { this.isLoading = false; }
    });
  }

  onCancel(): void { this.dialogRef.close(false); }
}