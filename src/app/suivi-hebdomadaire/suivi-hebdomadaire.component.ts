import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { SuiviService } from '../core/services/suivi.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { StageService } from '../core/services/stage.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-suivi-hebdomadaire',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressBarModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule, MatChipsModule
  ],
  templateUrl: './suivi-hebdomadaire.component.html',
  styleUrls: ['./suivi-hebdomadaire.component.scss']
})
export class SuiviHebdomadaireComponent implements OnInit {
  @ViewChild('formDialog') formDialog!: TemplateRef<any>;
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  suivis: any[] = [];
  filteredSuivis: any[] = [];
  mesStages: any[] = [];
  selectedStageId: number | null = null;
  isLoading = false;
  editingId: number | null = null;
  selectedSuivi: any = null;
  userRole = '';

  form: FormGroup;

  get moyenneProgression(): number {
    if (!this.suivis.length) return 0;
    return Math.round(this.suivis.reduce((s, v) => s + (v.progression ?? 0), 0) / this.suivis.length);
  }

  get moyenneNote(): number {
    const avecNote = this.suivis.filter(s => s.note);
    if (!avecNote.length) return 0;
    return Math.round(avecNote.reduce((s, v) => s + v.note, 0) / avecNote.length * 10) / 10;
  }

  get dernierSuivi(): any {
    return this.suivis.sort((a, b) => b.semaineNumero - a.semaineNumero)[0];
  }

  constructor(
    private suiviService: SuiviService,
    private stageService: StageService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.form = this.fb.group({
  stageId: [null, Validators.required],
  semaineNumero: [null, [Validators.required, Validators.min(1), Validators.max(52)]],
  dateSuivi: [null, Validators.required],
  progression: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  note: [null, [Validators.min(0), Validators.max(20)]],
  commentaire: [''],
  pointsPositifs: [''],
  axesAmelioration: [''],
  joursPresents: [5, [Validators.min(0), Validators.max(5)]],
  joursAbsences: [0, [Validators.min(0), Validators.max(5)]],
  motifAbsence: [''],
  tachesAssignees: [''],
  tachesCompletees: [''],
  tauxCompletionTaches: [0, [Validators.min(0), Validators.max(100)]]
});


  }

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    this.loadMesStages();
    this.loadMesSuivis();
  }

  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }
  get isAdmin(): boolean { return ['ADMIN_RH', 'RESPONSABLE_RH'].includes(this.userRole); }

  loadMesStages(): void {
    this.stageService.getMesStages().subscribe({
      next: (data) => this.mesStages = data,
      error: () => {}
    });
  }

  loadMesSuivis(): void {
    this.isLoading = true;
    this.suiviService.getMesSuivis().subscribe({
      next: (data) => {
        this.suivis = data.sort((a: any, b: any) => b.semaineNumero - a.semaineNumero);
        this.filteredSuivis = this.suivis;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadByStage(stageId: number): void {
    this.isLoading = true;
    this.suiviService.getByStage(stageId).subscribe({
      next: (data) => {
        this.suivis = data.sort((a: any, b: any) => b.semaineNumero - a.semaineNumero);
        this.filteredSuivis = this.suivis;
        this.isLoading = false;
      },
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
        axesAmelioration: suivi.axesAmelioration,
        joursPresents: suivi.joursPresents ?? 5,
        joursAbsences: suivi.joursAbsences ?? 0,
        motifAbsence: suivi.motifAbsence,
        tachesAssignees: suivi.tachesAssignees,
        tachesCompletees: suivi.tachesCompletees,
        tauxCompletionTaches: suivi.tauxCompletionTaches ?? 0
      }
    
    );
if (suivi?.joursPresents !== undefined) {
  this.joursPresentsSet = new Set(
    Array.from({length: suivi.joursPresents}, (_, i) => i + 1)
  );
} else {
  this.joursPresentsSet = new Set([1, 2, 3, 4, 5]);
}
    } else {
      this.editingId = null;
      this.form.reset({ progression: 0 });
    }
    this.dialog.open(this.formDialog, { width: '680px' });

    


  }

  voirDetail(suivi: any): void {
    this.selectedSuivi = suivi;
    this.dialog.open(this.detailDialog, { width: '560px' });
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
        this.snackBar.open(this.editingId ? '✅ Suivi mis à jour' : '✅ Suivi créé', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.loadMesSuivis();
      },
      error: () => this.snackBar.open('Erreur sauvegarde', 'Fermer', { duration: 3000 })
    });
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Supprimer ce suivi ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.suiviService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Suivi supprimé', 'Fermer', { duration: 3000 });
          this.suivis = this.suivis.filter(s => s.id !== id);
          this.filteredSuivis = this.filteredSuivis.filter(s => s.id !== id);
          this.dialog.closeAll();
        }
      });
    });
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'note-excellent';
    if (note >= 12) return 'note-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
  }

  getNoteLabel(note: number): string {
    if (note >= 16) return 'Excellent';
    if (note >= 12) return 'Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getProgClass(prog: number): string {
    if (prog >= 75) return 'prog-high';
    if (prog >= 50) return 'prog-mid';
    return 'prog-low';
  }

  joursSemaine = [
  { num: 1, label: 'Lun' },
  { num: 2, label: 'Mar' },
  { num: 3, label: 'Mer' },
  { num: 4, label: 'Jeu' },
  { num: 5, label: 'Ven' }
];

joursPresentsSet = new Set<number>([1, 2, 3, 4, 5]);

isPresent(num: number): boolean {
  return this.joursPresentsSet.has(num);
}

toggleJour(num: number): void {
  if (this.joursPresentsSet.has(num)) {
    this.joursPresentsSet.delete(num);
  } else {
    this.joursPresentsSet.add(num);
  }
  const presents = this.joursPresentsSet.size;
  this.form.patchValue({
    joursPresents: presents,
    joursAbsences: 5 - presents
  });
}

  
}