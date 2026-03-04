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
import { ConventionService } from '../../core/services/convention.service';
import { StageService } from '../../core/services/stage.service';

@Component({
  selector: 'app-convention-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule
  ],
  templateUrl: './convention-form.component.html',
  styleUrls: ['./convention-form.component.scss']
})
export class ConventionFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  stages: any[] = [];
  statuts = ['BROUILLON', 'SOUMISE', 'APPROUVEE', 'SIGNEE', 'REJETEE'];

  constructor(
    private fb: FormBuilder,
    private conventionService: ConventionService,
    private stageService: StageService,
    private dialogRef: MatDialogRef<ConventionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      stageId: ['', Validators.required],
      numero: [''],
      statut: ['BROUILLON'],
      dateEmission: ['']
    });
  }

  ngOnInit(): void {
    this.stageService.getAll().subscribe(d => this.stages = d);
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({ ...this.data, stageId: this.data.stageId });
    }
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