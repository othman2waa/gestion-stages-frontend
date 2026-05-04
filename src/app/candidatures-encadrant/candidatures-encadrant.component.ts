import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-candidatures-encadrant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatDialogModule, MatSnackBarModule, MatFormFieldModule,
    MatInputModule, MatProgressBarModule, MatTooltipModule, MatChipsModule
  ],
  templateUrl: './candidatures-encadrant.component.html',
  styleUrls: ['./candidatures-encadrant.component.scss']
})
export class CandidaturesEncadrantComponent implements OnInit {
  @ViewChild('meetingDialog')  meetingDialog!:  TemplateRef<any>;
  @ViewChild('decisionDialog') decisionDialog!: TemplateRef<any>;
  @ViewChild('cvDialog')       cvDialog!:       TemplateRef<any>;

  candidatures: any[] = [];
  filtered: any[] = [];
  isLoading = true;
  searchTerm = '';
  filterStatut = '';
  selected: any = null;
  cvUrl: string | null = null;

  meetingForm: FormGroup;
  decisionForm: FormGroup;

  private api = 'http://localhost:8080/api/candidatures';

  readonly statuts = ['EN_ATTENTE', 'MEETING_PLANIFIE', 'ACCEPTEE_ENCADRANT', 'REFUSEE_ENCADRANT'];

  readonly statutConf: Record<string, { label: string; color: string; icon: string }> = {
    EN_ATTENTE:          { label: 'En attente',       color: '#F59E0B', icon: 'hourglass_empty' },
    MEETING_PLANIFIE:    { label: 'Meeting planifié', color: '#0891B2', icon: 'event' },
    ACCEPTEE_ENCADRANT:  { label: 'Accepté',          color: '#00843D', icon: 'check_circle' },
    REFUSEE_ENCADRANT:   { label: 'Refusé',           color: '#DC2626', icon: 'cancel' },
    DOCUMENTS_REQUIS:    { label: 'Docs requis',      color: '#7C3AED', icon: 'upload_file' },
    DOCUMENTS_SOUMIS:    { label: 'Docs soumis',      color: '#059669', icon: 'task_alt' },
    ACCEPTEE_RH:         { label: 'Validé RH',        color: '#00843D', icon: 'verified' },
  };

  get enAttente(): number { return this.candidatures.filter(c => c.statut === 'EN_ATTENTE').length; }
  get meetingPlanifie(): number { return this.candidatures.filter(c => c.statut === 'MEETING_PLANIFIE').length; }
  get acceptes(): number { return this.candidatures.filter(c => c.statut === 'ACCEPTEE_ENCADRANT').length; }

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.meetingForm = this.fb.group({
      dateMeeting: ['', Validators.required]
    });
    this.decisionForm = this.fb.group({
      decision: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.api}/mon-departement`).subscribe({
      next: (d) => { this.candidatures = d; this.applyFilter(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  applyFilter(): void {
    this.filtered = this.candidatures.filter(c => {
      const matchSearch = !this.searchTerm ||
        `${c.prenom} ${c.nom} ${c.filiere} ${c.etablissement}`.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  getConf(statut: string) {
    return this.statutConf[statut] ?? { label: statut, color: '#94A3B8', icon: 'circle' };
  }

  getInitials(prenom: string, nom: string): string {
    return `${prenom?.charAt(0) ?? ''}${nom?.charAt(0) ?? ''}`.toUpperCase();
  }

  ouvrirMeeting(c: any): void {
    this.selected = c;
    this.meetingForm.reset();
    this.dialog.open(this.meetingDialog, { width: '480px', disableClose: true });
  }

  planifierMeeting(): void {
    if (this.meetingForm.invalid || !this.selected) return;
    this.http.patch(`${this.api}/${this.selected.id}/planifier-meeting`,
      { dateMeeting: this.meetingForm.value.dateMeeting }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Meeting planifié — Email envoyé au candidat', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.load();
      }
    });
  }

  ouvrirDecision(c: any): void {
    this.selected = c;
    this.decisionForm.reset({ decision: 'ACCEPTE' });
    this.dialog.open(this.decisionDialog, { width: '500px', disableClose: true });
  }

  envoyerDecision(): void {
    if (this.decisionForm.invalid || !this.selected) return;
    this.http.patch(`${this.api}/${this.selected.id}/decision-encadrant`,
      this.decisionForm.value
    ).subscribe({
      next: () => {
        const msg = this.decisionForm.value.decision === 'ACCEPTE'
          ? '✅ Candidat accepté — Email + identifiants envoyés'
          : '❌ Candidat refusé — Email de notification envoyé';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        this.dialog.closeAll();
        this.load();
      }
    });
  }

  voirCv(id: number): void {
    this.http.get(`${this.api}/${id}/cv`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.cvUrl = window.URL.createObjectURL(blob);
        this.dialog.open(this.cvDialog, { width: '80vw', height: '90vh' });
      }
    });
  }
}