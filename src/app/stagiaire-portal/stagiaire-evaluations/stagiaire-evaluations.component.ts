import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { EvaluationService } from '../../core/services/evaluation.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-stagiaire-evaluations',
  standalone: true,
  imports: [
    PageHeaderComponent,CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatChipsModule],
  templateUrl: './stagiaire-evaluations.component.html',
  styleUrls: ['./stagiaire-evaluations.component.scss']
})
export class StagiaireEvaluationsComponent implements OnInit {
  evaluations: any[] = [];
  isLoading = true;
  moyenne = 0;

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    this.evaluationService.getMesEvaluations().subscribe({
      next: (data) => {
        this.evaluations = data;
        if (data.length > 0) {
          this.moyenne = data.reduce((sum: number, e: any) => sum + e.note, 0) / data.length;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'excellent';
    if (note >= 12) return 'bien';
    if (note >= 10) return 'passable';
    return 'insuffisant';
  }

  getNoteLabel(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }
}