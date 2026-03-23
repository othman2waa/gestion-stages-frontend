import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { RapportService } from '../core/services/rapport.service';
import { StagiaireDashboardService } from '../core/services/stagiaire-dashboard.service';

@Component({
  selector: 'app-rapport-stage',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatSnackBarModule, MatTooltipModule, MatChipsModule
  ],
  templateUrl: './rapport-stage.component.html',
  styleUrls: ['./rapport-stage.component.scss']
})
export class RapportStageComponent implements OnInit {
  dashboard: any = null;
  rapport: any = null;
  isLoading = true;
  isUploading = false;
  selectedFile: File | null = null;

  constructor(
    private rapportService: RapportService,
    private dashService: StagiaireDashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dashService.getMonDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        if (data.stageId) this.loadRapport(data.stageId);
        else this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadRapport(stageId: number): void {
    this.rapportService.getMeta(stageId).subscribe({
      next: (data) => { this.rapport = data; this.isLoading = false; },
      error: () => { this.rapport = null; this.isLoading = false; }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.snackBar.open('Seuls les fichiers PDF sont acceptés', 'Fermer', { duration: 3000 });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('Fichier trop volumineux (max 10 MB)', 'Fermer', { duration: 3000 });
      return;
    }
    this.selectedFile = file;
  }

  upload(): void {
    if (!this.selectedFile || !this.dashboard?.stageId) return;
    this.isUploading = true;
    this.rapportService.upload(this.dashboard.stageId, this.selectedFile).subscribe({
      next: (data) => {
        this.rapport = data;
        this.selectedFile = null;
        this.isUploading = false;
        this.snackBar.open('Rapport uploadé avec succès ✓', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.isUploading = false;
        this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
      }
    });
  }

  download(): void {
    if (!this.dashboard?.stageId) return;
    this.rapportService.download(this.dashboard.stageId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.rapport?.nomFichier ?? 'rapport.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 })
    });
  }

  supprimer(): void {
    if (!confirm('Supprimer le rapport ?')) return;
    this.rapportService.delete(this.dashboard.stageId).subscribe({
      next: () => {
        this.rapport = null;
        this.snackBar.open('Rapport supprimé', 'Fermer', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 })
    });
  }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}