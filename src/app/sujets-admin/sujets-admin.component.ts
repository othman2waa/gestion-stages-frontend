import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SujetStageService } from '../core/services/sujet-stage.service';
import { EncadrantService } from '../core/services/encadrant.service';
import { StageService } from '../core/services/stage.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sujets-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule, MatProgressBarModule,
    MatTooltipModule, MatChipsModule
  ],
  templateUrl: './sujets-admin.component.html',
  styleUrls: ['./sujets-admin.component.scss']
})
export class SujetsAdminComponent implements OnInit {

  @ViewChild('affecterDialog') affecterDialog!: TemplateRef<any>;
  @ViewChild('nouveauDialog') nouveauDialog!: TemplateRef<any>;

  sujets: any[] = [];
  encadrants: any[] = [];
  stages: any[] = [];
  isLoading = true;
  filterStatut = '';
  searchTerm = '';
  selectedSujet: any = null;

  affecterForm: FormGroup;
  nouveauForm: FormGroup;

  readonly statuts = ['PROPOSE', 'VALIDE', 'REFUSE', 'AFFECTE'];
  readonly typeStages = ['PFE', 'PFA', 'STAGE_ETE', 'STAGE_OBSERVATION'];
  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+5', 'Ingénieur'];

  get proposes(): number { return this.sujets.filter(s => s.statut === 'PROPOSE').length; }
  get valides(): number { return this.sujets.filter(s => s.statut === 'VALIDE').length; }
  get affectes(): number { return this.sujets.filter(s => s.statut === 'AFFECTE').length; }

  get filtered(): any[] {
    return this.sujets.filter(s => {
      const matchSearch = !this.searchTerm ||
        `${s.titre} ${s.encadrantNom} ${s.technologies}`.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchStatut = !this.filterStatut || s.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  constructor(
    private sujetService: SujetStageService,
    private encadrantService: EncadrantService,
    private stageService: StageService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.affecterForm = this.fb.group({
      stageId: [null, Validators.required],
      encadrantId: [null]
    });
    this.nouveauForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      technologies: [''],
      niveauRequis: [''],
      typeStage: ['PFE'],
      encadrantId: [null],
    });
  }

  ngOnInit(): void {
    this.load();
    this.encadrantService.getAll().subscribe(d => this.encadrants = d);
    this.stageService.getAll().subscribe(d => this.stages = d.filter((s: any) => !s.sujetValide));
  }

  load(): void {
    this.isLoading = true;
    this.sujetService.getAll().subscribe({
      next: (d) => { this.sujets = d; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  valider(s: any): void {
    this.sujetService.valider(s.id).subscribe({
      next: () => { s.statut = 'VALIDE'; this.snackBar.open('✅ Sujet validé', 'Fermer', { duration: 2000 }); }
    });
  }

  refuser(s: any): void {
    this.sujetService.refuser(s.id).subscribe({
      next: () => { s.statut = 'REFUSE'; this.snackBar.open('❌ Sujet refusé', 'Fermer', { duration: 2000 }); }
    });
  }

  ouvrirAffecter(s: any): void {
    this.selectedSujet = s;
    this.affecterForm.reset({ encadrantId: s.encadrantId });
    this.dialog.open(this.affecterDialog, { width: '500px' });
  }

  affecter(): void {
    if (this.affecterForm.invalid || !this.selectedSujet) return;
    this.sujetService.affecter(this.selectedSujet.id, this.affecterForm.value).subscribe({
      next: () => {
        this.snackBar.open('✅ Sujet affecté au stage', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.load();
      }
    });
  }

  ouvrirNouveau(): void {
    this.nouveauForm.reset({ typeStage: 'PFE' });
    this.dialog.open(this.nouveauDialog, { width: '550px' });
  }

  creer(): void {
    if (this.nouveauForm.invalid) return;
    this.sujetService.proposer(this.nouveauForm.value).subscribe({
      next: () => {
        this.snackBar.open('✅ Sujet créé', 'Fermer', { duration: 2000 });
        this.dialog.closeAll();
        this.load();
      }
    });
  }

  supprimer(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Supprimer ce sujet ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.sujetService.supprimer(id).subscribe({
        next: () => { this.sujets = this.sujets.filter(s => s.id !== id); }
      });
    });
  }

  getStatutConf(statut: string): { color: string; label: string; icon: string } {
    const map: any = {
      PROPOSE:  { color: '#F59E0B', label: 'Proposé',  icon: 'pending' },
      VALIDE:   { color: '#00843D', label: 'Validé',   icon: 'check_circle' },
      REFUSE:   { color: '#DC2626', label: 'Refusé',   icon: 'cancel' },
      AFFECTE:  { color: '#1E40AF', label: 'Affecté',  icon: 'assignment_ind' },
    };
    return map[statut] ?? { color: '#94A3B8', label: statut, icon: 'circle' };
  }
}