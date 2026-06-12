import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { ExportService } from '../core/services/export.service';

interface LigneRemuneration {
  stagiaireNom: string;
  stagiairePrenom: string;
  email: string;
  cin: string;
  filiere: string;
  niveau: string;
  etablissement: string;
  departement: string;
  sujet: string;
  dateDebut: string;
  dateFin: string;
  dureeMois: number;
  dureeJours: number;
  numeroAttestation: string;
  dateAttestation: string;
}

interface GroupeDepartement {
  departement: string;
  total: number;
  stagiaires: LigneRemuneration[];
}

interface ResultatRemuneration {
  tranche: string;
  libelle: string;
  debut: string;
  fin: string;
  total: number;
  stagiaires: LigneRemuneration[];
  parDepartement: GroupeDepartement[];
}

@Component({
  selector: 'app-remuneration',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatSelectModule,
    MatFormFieldModule, MatProgressBarModule, MatTooltipModule, MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './remuneration.component.html',
  styleUrls: ['./remuneration.component.scss']
})
export class RemunerationComponent implements OnInit {

  private api = `${environment.apiUrl}/remuneration`;

  annee = new Date().getFullYear();
  tranche: 'JUILLET' | 'SEPTEMBRE' = (new Date().getMonth() + 1 === 8 || new Date().getMonth() + 1 === 9)
    ? 'SEPTEMBRE' : 'JUILLET';
  annees: number[] = [];

  departementFiltre = 'TOUS';

  loading = false;
  error = false;
  resultat: ResultatRemuneration | null = null;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {
    const courante = new Date().getFullYear();
    for (let a = courante + 1; a >= courante - 3; a--) { this.annees.push(a); }
  }

  ngOnInit(): void {
    this.charger();
  }

  get groupes(): GroupeDepartement[] {
    return this.resultat?.parDepartement ?? [];
  }

  /** Lignes affichées selon le filtre département sélectionné. */
  get lignesFiltrees(): LigneRemuneration[] {
    const toutes = this.resultat?.stagiaires ?? [];
    if (this.departementFiltre === 'TOUS') { return toutes; }
    return toutes.filter(l => (l.departement || '(Non affecté)') === this.departementFiltre);
  }

  charger(): void {
    this.loading = true;
    this.error = false;
    this.departementFiltre = 'TOUS';
    const url = `${this.api}/eligibles?annee=${this.annee}&tranche=${this.tranche}`;
    this.http.get<ResultatRemuneration>(url).subscribe({
      next: (res) => { this.resultat = res; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  filtrerDepartement(dep: string): void {
    this.departementFiltre = (this.departementFiltre === dep) ? 'TOUS' : dep;
  }

  exporter(): void {
    const lignes = this.lignesFiltrees;
    if (!lignes.length) {
      this.snackBar.open('Aucun stagiaire à exporter', 'OK', { duration: 3000 });
      return;
    }
    const rows = lignes.map((l, i) => ({
      'N°': i + 1,
      'Nom': l.stagiaireNom,
      'Prénom': l.stagiairePrenom,
      'CIN': l.cin || '—',
      'Email': l.email || '—',
      'Établissement': l.etablissement || '—',
      'Filière': l.filiere || '—',
      'Niveau': l.niveau || '—',
      'Département OCP': l.departement || '(Non affecté)',
      'Sujet du stage': l.sujet || '—',
      'Date début': l.dateDebut || '—',
      'Date fin': l.dateFin || '—',
      'Durée (mois)': l.dureeMois,
      'N° Attestation': l.numeroAttestation || '—'
    }));
    const suffixe = this.departementFiltre === 'TOUS'
      ? '' : '-' + this.departementFiltre.replace(/[^a-zA-Z0-9]+/g, '_');
    const nom = `remuneration-pfe-${this.tranche.toLowerCase()}-${this.annee}${suffixe}`;
    this.exportService.exportExcel(rows, nom, 'Rémunération PFE');
    this.snackBar.open(`${rows.length} stagiaire(s) exporté(s)`, 'OK', { duration: 3000 });
  }

  imprimer(): void {
    window.print();
  }
}
