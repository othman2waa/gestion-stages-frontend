import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SuiviService } from '../core/services/suivi.service';
import { StageService } from '../core/services/stage.service';

@Component({
  selector: 'app-suivi-hebdomadaire',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressBarModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule
  ],
  templateUrl: './suivi-hebdomadaire.component.html',
  styleUrls: ['./suivi-hebdomadaire.component.scss']
})
export class SuiviHebdomadaireComponent implements OnInit {
  suivis: any[] = [];
  mesStages: any[] = [];
  selectedStageId: number | null = null;
  isLoading = false;
  showForm = false;
  editingId: number | null = null;

  form: FormGroup;

  constructor(
    private suiviService: SuiviService,
    private stageService: StageService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      stageId: [null, Validators.required],
      semaineNumero: [null, [Validators.required, Validators.min(1), Validators.max(52)]],
      dateSuivi: [null, Validators.required],
      progression: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      note: [null, [Validators.min(0), Validators.max(20)]],
      commentaire: [''],
      pointsPositifs: [''],
      axesAmelioration: ['']
    });
  }

  ngOnInit(): void {
    this.loadMesStages();
    this.loadMesSuivis();
  }

  loadMesStages(): void {
    this.stageService.getMesStages().subscribe({
      next: (data) => this.mesStages = data,
      error: () => {}
    });
  }

  loadMesSuivis(): void {
    this.isLoading = true;
    this.suiviService.getMesSuivis().subscribe({
      next: (data) => { this.suivis = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  loadByStage(stageId: number): void {
    this.isLoading = true;
    this.suiviService.getByStage(stageId).subscribe({
      next: (data) => { this.suivis = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  onStageFilter(stageId: number): void {
    this.selectedStageId = stageId;
    if (stageId) this.loadByStage(stageId);
    else this.loadMesSuivis();
  }

  openForm(suivi?: any): void {
    if (suivi) {
      this.editingId = suivi.id;
      this.form.patchValue({
        stageId: suivi.stageId,
        semaineNumero: suivi.semaineNumero,
        dateSuivi: new Date(suivi.dateSuivi),
        progression: suivi.progression,
        note: suivi.note,
        commentaire: suivi.commentaire,
        pointsPositifs: suivi.pointsPositifs,
        axesAmelioration: suivi.axesAmelioration
      });
    } else {
      this.editingId = null;
      this.form.reset({ progression: 0 });
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ progression: 0 });
  }

  submit(): void {
    if (this.form.invalid) return;
    const payload = {
      ...this.form.value,
      dateSuivi: this.form.value.dateSuivi?.toISOString?.()?.split('T')[0] ?? this.form.value.dateSuivi
    };

    const obs = this.editingId
      ? this.suiviService.update(this.editingId, payload)
      : this.suiviService.create(payload);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Suivi mis à jour ✓' : 'Suivi créé ✓', 'Fermer', { duration: 3000 });
        this.closeForm();
        this.loadMesSuivis();
      },
      error: () => this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 })
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer ce suivi ?')) return;
    this.suiviService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Suivi supprimé', 'Fermer', { duration: 3000 });
        this.suivis = this.suivis.filter(s => s.id !== id);
      },
      error: () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 })
    });
  }

  getNoteColor(note: number): string {
    if (note >= 16) return 'note-excellent';
    if (note >= 12) return 'note-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
  }
}