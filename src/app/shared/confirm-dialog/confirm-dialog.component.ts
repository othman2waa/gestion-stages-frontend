import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmDialogData {
  title: string;
  message: string;
  inputLabel?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <mat-form-field *ngIf="data.inputLabel" appearance="outline" class="full-width">
        <mat-label>{{ data.inputLabel }}</mat-label>
        <textarea matInput [(ngModel)]="inputValue" rows="3"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelText || 'Annuler' }}</button>
      <button mat-flat-button color="primary" (click)="onConfirm()">{{ data.confirmText || 'Confirmer' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-top: 8px; }
    mat-dialog-content p { margin: 0 0 8px; color: rgba(0,0,0,.7); }
    mat-dialog-actions { padding: 8px 0 0; }
  `]
})
export class ConfirmDialogComponent {
  inputValue = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(this.data.inputLabel ? null : false);
  }

  onConfirm(): void {
    this.dialogRef.close(this.data.inputLabel ? this.inputValue : true);
  }
}
