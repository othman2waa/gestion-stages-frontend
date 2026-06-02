import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-user-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="profile-header">
      <div class="profile-avatar">{{ initials }}</div>
      <div class="profile-title">
        <h3>{{ user?.username ?? 'Utilisateur' }}</h3>
        <span class="role-badge">{{ roleLabel }}</span>
      </div>
      <button mat-icon-button mat-dialog-close><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content>
      <div class="profile-sections">
        <div class="profile-section">
          <p class="section-title">Informations du compte</p>
          <div class="info-row">
            <mat-icon>person</mat-icon>
            <div><span class="info-label">Nom d'utilisateur</span><span class="info-val">{{ user?.username }}</span></div>
          </div>
          <div class="info-row">
            <mat-icon>email</mat-icon>
            <div><span class="info-label">Email</span><span class="info-val">{{ user?.email ?? '—' }}</span></div>
          </div>
          <div class="info-row">
            <mat-icon>badge</mat-icon>
            <div><span class="info-label">Rôle</span><span class="info-val">{{ roleLabel }}</span></div>
          </div>
          <div class="info-row">
            <mat-icon>fingerprint</mat-icon>
            <div><span class="info-label">ID Utilisateur</span><span class="info-val">#{{ user?.userId }}</span></div>
          </div>
        </div>

        <div class="profile-section">
          <p class="section-title">Sécurité</p>
          <div class="security-card" (click)="openChangePassword()">
            <div class="security-icon"><mat-icon>lock</mat-icon></div>
            <div>
              <span class="security-title">Changer le mot de passe</span>
              <span class="security-sub">Mettez à jour votre mot de passe</span>
            </div>
            <mat-icon class="security-arrow">chevron_right</mat-icon>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .profile-header {
      background: linear-gradient(135deg, #003B1C 0%, #00843D 100%);
      padding: 20px 24px; display: flex; align-items: center; gap: 14px;
      margin: -24px -24px 0;
    }
    .profile-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(255,255,255,0.2); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 20px; flex-shrink: 0;
    }
    .profile-title { flex: 1;
      h3 { margin: 0; color: white; font-size: 18px; }
    }
    .role-badge {
      display: inline-block; background: rgba(255,255,255,0.2); color: white;
      padding: 2px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
    }
    .profile-header button { color: rgba(255,255,255,0.8); }

    .profile-sections { padding-top: 8px; }
    .profile-section {
      padding: 12px 0; border-bottom: 1px solid #f1f5f9;
      &:last-child { border-bottom: none; }
    }
    .section-title {
      font-size: 11px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;
    }
    .info-row {
      display: flex; align-items: center; gap: 12px; padding: 8px 0;
      mat-icon { font-size: 18px; color: #00843D; flex-shrink: 0; }
      .info-label { display: block; font-size: 11px; color: #94a3b8; }
      .info-val { display: block; font-size: 14px; font-weight: 500; color: #1e293b; }
    }
    .security-card {
      display: flex; align-items: center; gap: 14px; padding: 14px;
      background: #f8fafc; border-radius: 10px; cursor: pointer;
      border: 1px solid #f1f5f9; transition: all 0.15s;
      &:hover { background: #f0fdf4; border-color: #BBF7D0; }
    }
    .security-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: #DCFCE7; color: #00843D;
      display: flex; align-items: center; justify-content: center;
    }
    .security-title { display: block; font-size: 13px; font-weight: 600; color: #1e293b; }
    .security-sub { display: block; font-size: 11px; color: #94a3b8; }
    .security-arrow { color: #CBD5E1; margin-left: auto; }
  `]
})
export class UserProfileDialogComponent implements OnInit {
  user: any = null;

  get initials(): string {
    const name = this.user?.username ?? '';
    return name.substring(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      ADMIN_RH: 'Administrateur RH',
      RESPONSABLE_RH: 'Responsable RH',
      ENCADRANT: 'Encadrant',
      STAGIAIRE: 'Stagiaire'
    };
    return map[this.user?.role] ?? this.user?.role ?? '—';
  }

  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, { width: '440px' });
  }
}
