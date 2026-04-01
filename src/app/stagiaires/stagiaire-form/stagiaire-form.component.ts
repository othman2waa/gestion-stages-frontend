import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StagiaireService } from '../../core/services/stagiaire.service';
import { DepartementService } from '../../core/services/departement.service';

@Component({
  selector: 'app-stagiaire-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSelectModule
  ],
  templateUrl: './stagiaire-form.component.html',
  styleUrls: ['./stagiaire-form.component.scss']
})
export class StagiaireFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  departements: any[] = [];

  constructor(
    private fb: FormBuilder,
    private stagiaireService: StagiaireService,
    private deptService: DepartementService,
    private dialogRef: MatDialogRef<StagiaireFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      cin: [''],
      filiere: [''],
      niveau: [''],
      departementId: [null]
    });
  }

  ngOnInit(): void {
    this.deptService.getActifs().subscribe(data => this.departements = data);
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue({
        ...this.data,
        departementId: this.data.departementId ?? null
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    const request = this.isEdit
      ? this.stagiaireService.update(this.data.id, this.form.value)
      : this.stagiaireService.create(this.form.value);
    request.subscribe({
      next: () => { this.isLoading = false; this.dialogRef.close(true); },
      error: () => { this.isLoading = false; }
    });
  }

  onCancel(): void { this.dialogRef.close(false); }
}