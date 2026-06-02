import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="cp-dialog">
      <div class="cp-header">
        <mat-icon>lock</mat-icon>
        <div>
          <h2>Changer le mot de passe</h2>
          <p>Saisissez votre ancien et nouveau mot de passe</p>
        </div>
      </div>

      <mat-dialog-content>
        <div class="cp-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Ancien mot de passe</mat-label>
            <input matInput [type]="showOld ? 'text' : 'password'" [(ngModel)]="oldPassword">
            <button mat-icon-button matSuffix (click)="showOld = !showOld">
              <mat-icon>{{ showOld ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nouveau mot de passe</mat-label>
            <input matInput [type]="showNew ? 'text' : 'password'" [(ngModel)]="newPassword">
            <button mat-icon-button matSuffix (click)="showNew = !showNew">
              <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-hint>Minimum 6 caractères</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmer le nouveau mot de passe</mat-label>
            <input matInput [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="confirmPassword">
            <button mat-icon-button matSuffix (click)="showConfirm = !showConfirm">
              <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <div class="cp-error" *ngIf="errorMsg">
            <mat-icon>error</mat-icon> {{ errorMsg }}
          </div>
          <div class="cp-success" *ngIf="successMsg">
            <mat-icon>check_circle</mat-icon> {{ successMsg }}
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Annuler</button>
        <button mat-raised-button color="primary" (click)="submit()" [disabled]="isLoading || !isValid">
          <mat-spinner diameter="18" *ngIf="isLoading"></mat-spinner>
          <span *ngIf="!isLoading"><mat-icon>save</mat-icon> Confirmer</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .cp-dialog { min-width: 380px; }
    .cp-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 24px 8px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #00843D; }
      h2 { margin: 0; font-size: 18px; font-weight: 600; }
      p { margin: 2px 0 0; font-size: 13px; color: #64748b; }
    }
    .cp-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .full-width { width: 100%; }
    .cp-error {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 14px; border-radius: 8px;
      background: #fef2f2; color: #dc2626; font-size: 13px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .cp-success {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 14px; border-radius: 8px;
      background: #f0fdf4; color: #00843D; font-size: 13px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    mat-dialog-actions button mat-icon { font-size: 18px; margin-right: 4px; }
  `]
})
export class ChangePasswordDialogComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOld = false;
  showNew = false;
  showConfirm = false;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  get isValid(): boolean {
    return this.oldPassword.length > 0 && this.newPassword.length >= 6 && this.newPassword === this.confirmPassword;
  }

  constructor(public dialogRef: MatDialogRef<ChangePasswordDialogComponent>, private authService: AuthService) {}

  submit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Les mots de passe ne correspondent pas';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMsg = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.isLoading = true;
    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.successMsg = 'Mot de passe modifié avec succès !';
        this.isLoading = false;
        setTimeout(() => this.dialogRef.close(true), 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.error ?? 'Erreur lors du changement de mot de passe';
        this.isLoading = false;
      }
    });
  }
}
