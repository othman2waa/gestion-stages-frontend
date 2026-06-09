import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="not-found">
      <div class="nf-card">
        <div class="nf-icon">
          <mat-icon>explore_off</mat-icon>
        </div>
        <h1>404</h1>
        <h2>Page introuvable</h2>
        <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <div class="nf-actions">
          <a mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>home</mat-icon> Tableau de bord
          </a>
          <a mat-stroked-button routerLink="/auth/login">
            <mat-icon>login</mat-icon> Connexion
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      position: relative; overflow: hidden;
    }
    .not-found::before {
      content: ''; position: absolute; width: 500px; height: 500px;
      border-radius: 50%; background: rgba(0,132,61,0.04);
      top: -150px; right: -100px;
    }
    .nf-card {
      text-align: center; padding: 48px 40px; background: white;
      border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.06);
      max-width: 440px; width: 100%; position: relative;
      border: 1px solid #F1F5F9;
      animation: fadeUp 0.4s ease-out;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .nf-icon {
      width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 20px;
      background: linear-gradient(135deg, #FEE2E2, #FECACA);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #EF4444; }
    }
    h1 { font-size: 64px; font-weight: 900; color: #1E293B; margin: 0; line-height: 1; letter-spacing: -0.04em; }
    h2 { font-size: 18px; font-weight: 700; color: #475569; margin: 8px 0 12px; }
    p { color: #94A3B8; font-size: 14px; margin: 0 0 28px; }
    .nf-actions { display: flex; gap: 12px; justify-content: center; }
  `]
})
export class NotFoundComponent {}
