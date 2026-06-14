import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * En-tête de page réutilisable (titre + icône + sous-titre + zone d'actions).
 * Évite la répétition du bloc « page-header » dans chaque composant.
 *
 * Usage :
 *   <app-page-header icon="school" titre="Stagiaires" sousTitre="12 au total">
 *     <button mat-stroked-button>...</button>   <!-- actions (optionnel) -->
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="app-page-header">
      <div class="aph-text">
        <h2><mat-icon *ngIf="icon">{{ icon }}</mat-icon> {{ titre }}</h2>
        <p *ngIf="sousTitre">{{ sousTitre }}</p>
      </div>
      <div class="aph-actions"><ng-content></ng-content></div>
    </div>
  `,
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() icon = '';
  @Input() titre = '';
  @Input() sousTitre = '';
}
