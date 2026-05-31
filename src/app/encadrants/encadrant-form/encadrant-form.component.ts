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
import { EncadrantService } from '../../core/services/encadrant.service';
import { DepartementService } from '../../core/services/departement.service';

@Component({
  selector: 'app-encadrant-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSelectModule
  ],
  templateUrl: './encadrant-form.component.html',
  styleUrls: ['./encadrant-form.component.scss']
})
export class EncadrantFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEdit = false;
  departements: any[] = [];

  // Credentials après création
  showCredentials = false;
  generatedUsername = '';
  generatedPassword = '';

  constructor(
    private fb: FormBuilder,
    private encadrantService: EncadrantService,
    private deptService: DepartementService,
    private dialogRef: MatDialogRef<EncadrantFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fonction: [''],
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
    if (this.isEdit) {
      this.encadrantService.update(this.data.id, this.form.value).subscribe({
        next: () => { this.isLoading = false; this.dialogRef.close(true); },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.encadrantService.create(this.form.value).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.generatedUsername = response.username;
          this.generatedPassword = response.generatedPassword;
          this.showCredentials = true;
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  copyCredentials(): void {
    const text = `Identifiant: ${this.generatedUsername}\nMot de passe: ${this.generatedPassword}`;
    navigator.clipboard.writeText(text);
  }

  closeAfterCreation(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void { this.dialogRef.close(false); }
}