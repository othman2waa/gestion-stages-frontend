import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { AnnonceService } from '../core/services/annonce.service';
import { CandidatureService } from '../core/services/candidature.service';

@Component({
  selector: 'app-annonces-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatChipsModule,
    MatTooltipModule, MatSnackBarModule, MatProgressBarModule,
    MatDialogModule, MatSlideToggleModule, MatBadgeModule
  ],
  templateUrl: './annonces-admin.component.html',
  styleUrls: ['./annonces-admin.component.scss']
})
export class AnnoncesAdminComponent implements OnInit {
  @ViewChild('annonceDialog') annonceDialog!: TemplateRef<any>;
  @ViewChild('candidaturesDialog') candidaturesDialog!: TemplateRef<any>;

  annonces: any[] = [];
  candidaturesByAnnonce: any[] = [];
  isLoading = true;
  editingId: number | null = null;
  selectedAnnonce: any = null;

  form: FormGroup;

  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+4', 'Bac+5'];
  readonly typesStage = ['PFE', 'PFA', 'STAGE_ETE', 'STAGE_OBSERVATION'];
  readonly departements = ['Informatique', 'Finance', 'RH', 'Marketing', 'Production', 'Logistique'];

  constructor(
    private annonceService: AnnonceService,
    private candidatureService: CandidatureService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      competencesRequises: ['', Validators.required],
      departement: [''],
      typeStage: [''],
      niveauRequis: [''],
      filiereRequise: [''],
      nombrePostes: [1],
      dateLimite: [null],
      actif: [true]
    });
  }

  ngOnInit(): void { this.loadAnnonces(); }

  loadAnnonces(): void {
    this.isLoading = true;
    this.annonceService.getAll().subscribe({
      next: (data) => { this.annonces = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm(annonce?: any): void {
    this.editingId = annonce?.id ?? null;
    if (annonce) {
      this.form.patchValue({
        ...annonce,
        dateLimite: annonce.dateLimite ? new Date(annonce.dateLimite) : null
      });
    } else {
      this.form.reset({ nombrePostes: 1, actif: true });
    }
    this.dialog.open(this.annonceDialog, { width: '650px' });
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = {
      ...this.form.value,
      dateLimite: this.form.value.dateLimite instanceof Date
        ? this.form.value.dateLimite.toISOString().split('T')[0]
        : this.form.value.dateLimite
    };
    const obs = this.editingId
      ? this.annonceService.update(this.editingId, payload)
      : this.annonceService.create(payload);
    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? '✅ Annonce modifiée' : '✅ Annonce créée', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.loadAnnonces();
      },
      error: () => this.snackBar.open('Erreur', 'Fermer', { duration: 3000 })
    });
  }

  toggle(annonce: any): void {
    this.annonceService.toggle(annonce.id).subscribe({
      next: () => {
        annonce.actif = !annonce.actif;
        this.snackBar.open(annonce.actif ? '✅ Annonce activée' : '🔒 Annonce désactivée', 'Fermer', { duration: 3000 });
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette annonce ?')) return;
    this.annonceService.delete(id).subscribe({
      next: () => { this.snackBar.open('Annonce supprimée', 'Fermer', { duration: 3000 }); this.loadAnnonces(); }
    });
  }

  voirCandidatures(annonce: any): void {
    this.selectedAnnonce = annonce;
    this.candidatureService.getAll().subscribe({
      next: (data) => {
        this.candidaturesByAnnonce = data
          .filter((c: any) => c.annonceId === annonce.id)
          .sort((a: any, b: any) => (b.scoreMatching ?? 0) - (a.scoreMatching ?? 0));
        this.dialog.open(this.candidaturesDialog, { width: '800px', maxHeight: '90vh' });
      }
    });
  }

  getScoreClass(score: number): string {
    if (score >= 75) return 'score-excellent';
    if (score >= 50) return 'score-bon';
    if (score >= 25) return 'score-moyen';
    return 'score-faible';
  }

  getScoreLabel(score: number): string {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Bon';
    if (score >= 25) return 'Moyen';
    return 'Faible';
  }

  accepter(candidature: any): void {
    this.candidatureService.traiter(candidature.id, { statut: 'ACCEPTEE', commentaireRh: 'Profil sélectionné' }).subscribe({
      next: () => {
        candidature.statut = 'ACCEPTEE';
        this.snackBar.open('✅ Candidature acceptée — compte créé', 'Fermer', { duration: 4000 });
      }
    });
  }

  refuser(candidature: any): void {
    this.candidatureService.traiter(candidature.id, { statut: 'REFUSEE', commentaireRh: 'Profil non retenu' }).subscribe({
      next: () => {
        candidature.statut = 'REFUSEE';
        this.snackBar.open('❌ Candidature refusée', 'Fermer', { duration: 3000 });
      }
    });
  }
}