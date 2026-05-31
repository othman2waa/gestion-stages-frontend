import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { OnboardingChecklistService } from '../core/services/onboarding-checklist.service';
import { StagiaireService } from '../core/services/stagiaire.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressBarModule, MatTooltipModule,
    MatSnackBarModule, MatChipsModule, MatSelectModule
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  stagiaires: any[] = [];
  selectedStagiaireId: number | null = null;
  checklist: any[] = [];
  stats: any = null;
  isLoading = false;
  userRole = '';

  // Filtres
  searchTerm = '';
  filterDept = '';

  readonly categories = [
    { key: 'ADMINISTRATIF', label: 'Administratif', icon: 'folder', color: 'blue' },
    { key: 'INFORMATIQUE', label: 'Informatique', icon: 'computer', color: 'purple' },
    { key: 'INTEGRATION', label: 'Intégration', icon: 'people', color: 'green' },
    { key: 'MATERIEL', label: 'Matériel', icon: 'inventory', color: 'orange' },
    { key: 'FORMATION', label: 'Formation', icon: 'school', color: 'teal' }
  ];

  constructor(
    private checklistService: OnboardingChecklistService,
    private stagiaireService: StagiaireService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userRole = currentUser.role ?? '';
    this.stagiaireService.getAll().subscribe({
      next: (data) => this.stagiaires = data,
      error: () => {}
    });
  }

  get departementsDisponibles(): string[] {
    return [...new Set(this.stagiaires
      .map(s => s.departementNom)
      .filter(Boolean))].sort();
  }

  get filteredStagiaires(): any[] {
    return this.stagiaires.filter(s => {
      const matchSearch = !this.searchTerm ||
        `${s.prenom} ${s.nom} ${s.email} ${s.filiere}`
          .toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchDept = !this.filterDept || s.departementNom === this.filterDept;
      return matchSearch && matchDept;
    });
  }

  selectStagiaire(s: any): void {
    this.selectedStagiaireId = s.id;
    this.loadChecklist(s.id);
    this.loadStats(s.id);
  }

  loadChecklist(stagiaireId: number): void {
    this.isLoading = true;
    this.checklistService.getChecklist(stagiaireId).subscribe({
      next: (data: any[]) => { this.checklist = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  loadStats(stagiaireId: number): void {
    this.checklistService.getStats(stagiaireId).subscribe({
      next: (data: any) => this.stats = data,
      error: () => {}
    });
  }

  toggleItem(item: any): void {
    this.checklistService.completer(item.id).subscribe({
      next: (updated: any) => {
        item.completed = updated.completed;
        item.completedAt = updated.completedAt;
        item.completedBy = updated.completedBy;
        const msg = item.completed ? '✅ Étape complétée' : '↩️ Étape incomplète';
        this.snackBar.open(msg, 'Fermer', { duration: 2000 });
        if (this.selectedStagiaireId) this.loadStats(this.selectedStagiaireId);
      }
    });
  }

  getByCategorie(cat: string): any[] {
    return this.checklist.filter(c => c.categorie === cat);
  }

  getCompletedByCategorie(cat: string): number {
    return this.getByCategorie(cat).filter(c => c.completed).length;
  }

  getCatColor(key: string): string {
    return this.categories.find(c => c.key === key)?.color ?? 'blue';
  }

  getCatIcon(key: string): string {
    return this.categories.find(c => c.key === key)?.icon ?? 'check';
  }

  getProgressStagiaire(s: any): number {
    return s.onboardingProgress ?? 0;
  }

  closePanel(): void {
    this.selectedStagiaireId = null;
    this.checklist = [];
    this.stats = null;
  }

  get selectedStagiaire(): any {
    return this.stagiaires.find(s => s.id === this.selectedStagiaireId);
  }
}
