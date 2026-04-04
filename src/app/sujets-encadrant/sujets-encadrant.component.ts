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
import { SujetStageService } from '../core/services/sujet-stage.service';
import { DepartementService } from '../core/services/departement.service';

@Component({
  selector: 'app-sujets-encadrant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule, MatProgressBarModule, MatTooltipModule
  ],
  templateUrl: './sujets-encadrant.component.html',
  styleUrls: ['./sujets-encadrant.component.scss']
})
export class SujetsEncadrantComponent implements OnInit {

  @ViewChild('nouveauDialog') nouveauDialog!: TemplateRef<any>;

  sujets: any[] = [];
  departements: any[] = [];
  isLoading = true;
  nouveauForm: FormGroup;

  readonly typeStages = ['PFE', 'PFA', 'STAGE_ETE', 'STAGE_OBSERVATION'];
  readonly niveaux = ['Bac+2', 'Bac+3', 'Bac+5', 'Ingénieur'];

  get proposes(): number { return this.sujets.filter(s => s.statut === 'PROPOSE').length; }
  get valides(): number { return this.sujets.filter(s => s.statut === 'VALIDE').length; }
  get affectes(): number { return this.sujets.filter(s => s.statut === 'AFFECTE').length; }

  constructor(
    private sujetService: SujetStageService,
    private deptService: DepartementService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.nouveauForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      technologies: [''],
      niveauRequis: [''],
      typeStage: ['PFE'],
      departementId: [null]
    });
  }

  ngOnInit(): void {
    this.load();
    this.deptService.getActifs().subscribe(d => this.departements = d);
  }

  load(): void {
    this.isLoading = true;
    this.sujetService.getMesSujets().subscribe({
      next: (d) => { this.sujets = d; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  ouvrirNouveau(): void {
    this.nouveauForm.reset({ typeStage: 'PFE' });
    this.dialog.open(this.nouveauDialog, { width: '550px', disableClose: true });
  }

  proposer(): void {
    if (this.nouveauForm.invalid) return;
    this.sujetService.proposer(this.nouveauForm.value).subscribe({
      next: (s) => {
        this.sujets.unshift(s);
        this.snackBar.open('✅ Sujet proposé au RH avec succès', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
      }
    });
  }

  supprimer(id: number): void {
    if (!confirm('Supprimer ce sujet ?')) return;
    this.sujetService.supprimer(id).subscribe({
      next: () => {
        this.sujets = this.sujets.filter(s => s.id !== id);
        this.snackBar.open('Sujet supprimé', 'Fermer', { duration: 2000 });
      }
    });
  }

  getStatutConf(statut: string) {
    const map: any = {
      PROPOSE: { color: '#F59E0B', label: 'En attente RH',   icon: 'hourglass_empty' },
      VALIDE:  { color: '#00843D', label: 'Validé par RH',   icon: 'check_circle' },
      REFUSE:  { color: '#DC2626', label: 'Refusé par RH',   icon: 'cancel' },
      AFFECTE: { color: '#1E40AF', label: 'Affecté à un stage', icon: 'assignment_ind' },
    };
    return map[statut] ?? { color: '#94A3B8', label: statut, icon: 'circle' };
  }
}