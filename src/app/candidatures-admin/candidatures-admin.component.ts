import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CandidatureService } from '../core/services/candidature.service';
import { EncadrantService } from '../core/services/encadrant.service';
import { DepartementService } from '../core/services/departement.service';
import { ExportService } from '../core/services/export.service';

@Component({
  selector: 'app-candidatures-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatProgressBarModule, MatTooltipModule, MatTabsModule,
    MatBadgeModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './candidatures-admin.component.html',
  styleUrls: ['./candidatures-admin.component.scss']
})
export class CandidaturesAdminComponent implements OnInit {

  @ViewChild('acceptDialog') acceptDialog!: TemplateRef<any>;
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;
  @ViewChild('refusDialog') refusDialog!: TemplateRef<any>;

  candidatures: any[] = [];
  encadrants: any[] = [];
  departements: any[] = [];
  isLoading = true;
  selectedCandidature: any = null;
  searchTerm = '';

  acceptForm: FormGroup;
  refusForm: FormGroup;

  readonly typeStages = [
    { value: 'PFE', label: 'Projet de Fin d\'Études (PFE)' },
    { value: 'PFA', label: 'Projet de Fin d\'Année (PFA)' },
    { value: 'STAGE_ETE', label: 'Stage d\'Été' },
    { value: 'STAGE_OBSERVATION', label: 'Stage d\'Observation' }
  ];

  get enAttente(): any[] {
    return this.candidatures.filter(c => c.statut === 'EN_ATTENTE');
  }
  get acceptees(): any[] {
    return this.candidatures.filter(c => c.statut === 'ACCEPTEE');
  }
  get refusees(): any[] {
    return this.candidatures.filter(c => c.statut === 'REFUSEE');
  }
  get filtered(): any[] {
    if (!this.searchTerm) return this.candidatures;
    const t = this.searchTerm.toLowerCase();
    return this.candidatures.filter(c =>
      (c.nom + ' ' + c.prenom + ' ' + c.email + ' ' + c.filiere).toLowerCase().includes(t)
    );
  }

  constructor(
    private candidatureService: CandidatureService,
    private encadrantService: EncadrantService,
    private deptService: DepartementService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {
    this.acceptForm = this.fb.group({
      encadrantId: [null, Validators.required],
      departementId: [null, Validators.required],
      dateDebut: [null, Validators.required],
      dateFin: [null, Validators.required],
      typeStage: ['PFE', Validators.required],
      sujet: [''],
      commentaireRh: ['']
    });
    this.refusForm = this.fb.group({
      commentaireRh: ['']
    });
  }

  ngOnInit(): void {
    this.loadCandidatures();
    this.encadrantService.getAll().subscribe(d => this.encadrants = d);
    this.deptService.getActifs().subscribe(d => this.departements = d);
  }

  loadCandidatures(): void {
    this.isLoading = true;
    this.candidatureService.getAll().subscribe({
      next: (data) => { this.candidatures = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  ouvrirDetail(c: any): void {
    this.selectedCandidature = c;
    this.dialog.open(this.detailDialog, { width: '650px' });
  }

  ouvrirAcceptation(c: any): void {
    this.selectedCandidature = c;
    this.acceptForm.reset({
      typeStage: 'PFE',
      sujet: c.sujetSouhaite ?? ''
    });
    this.dialog.open(this.acceptDialog, { width: '600px', disableClose: true });
  }

  ouvrirRefus(c: any): void {
    this.selectedCandidature = c;
    this.refusForm.reset();
    this.dialog.open(this.refusDialog, { width: '450px' });
  }

  accepter(): void {
    if (this.acceptForm.invalid || !this.selectedCandidature) return;
    const payload = {
      statut: 'ACCEPTEE',
      ...this.acceptForm.value
    };
    this.candidatureService.traiter(this.selectedCandidature.id, payload).subscribe({
      next: () => {
        this.snackBar.open('✅ Candidature acceptée — compte créé et email envoyé', 'Fermer', { duration: 4000 });
        this.dialog.closeAll();
        this.loadCandidatures();
      },
      error: () => this.snackBar.open('Erreur lors de l\'acceptation', 'Fermer', { duration: 3000 })
    });
  }

  refuser(): void {
    if (!this.selectedCandidature) return;
    const payload = {
      statut: 'REFUSEE',
      commentaireRh: this.refusForm.value.commentaireRh
    };
    this.candidatureService.traiter(this.selectedCandidature.id, payload).subscribe({
      next: () => {
        this.snackBar.open('❌ Candidature refusée — email envoyé', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.loadCandidatures();
      },
      error: () => this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 })
    });
  }

  voirCv(id: number): void {
    this.candidatureService.getCv(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.snackBar.open('Erreur chargement CV', 'Fermer', { duration: 3000 })
    });
  }

  getScoreColor(score: number): string {
    if (score >= 75) return '#16a34a';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'statut-attente',
      'ACCEPTEE': 'statut-acceptee',
      'REFUSEE': 'statut-refusee'
    };
    return map[statut] ?? '';
  }

  getStatutIcon(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'hourglass_empty',
      'ACCEPTEE': 'check_circle',
      'REFUSEE': 'cancel'
    };
    return map[statut] ?? 'help';
  }

  exportExcel(): void { this.exportService.exportCandidatures(this.candidatures); }
  exportPdf(): void { this.exportService.exportCandidaturesPdf(this.candidatures); }
}