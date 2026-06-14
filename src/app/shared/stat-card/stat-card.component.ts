import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Carte d'indicateur (KPI) réutilisable : icône + valeur + libellé, déclinée en couleurs.
 * Optionnellement cliquable (filtre) avec un état actif.
 *
 * Usage :
 *   <app-stat-card color="orange" icon="hourglass_empty" [value]="enAttente" label="En attente">
 *   </app-stat-card>
 *   <app-stat-card color="blue" icon="people" [value]="total" label="Total"
 *                  [clickable]="true" [active]="filtre==='X'" (click)="...">
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="app-stat-card" [ngClass]="color"
         [class.clickable]="clickable" [class.active]="active">
      <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
      <div class="asc-body">
        <span class="asc-val">{{ value }}</span>
        <span class="asc-lbl">{{ label }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() icon = '';
  @Input() value: any;
  @Input() label = '';
  @Input() color: 'blue' | 'green' | 'orange' | 'purple' | 'amber' | 'red' | 'teal' | 'gray' = 'green';
  @Input() clickable = false;
  @Input() active = false;
}
