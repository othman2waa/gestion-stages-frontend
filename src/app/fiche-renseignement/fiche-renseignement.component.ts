import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';




@Component({
  selector: 'app-fiche-renseignement',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatSnackBarModule,
    MatProgressBarModule,MatTooltipModule
  ],
  templateUrl: './fiche-renseignement.component.html',
  styleUrls: ['./fiche-renseignement.component.scss']
})
export class FicheRenseignementComponent implements OnInit, OnChanges {
  @Input() profil: any = null;
  @Input() stage: any = null;

  form!: FormGroup;
  isSubmitting = false;
  isCompleted = false;

  readonly niveaux = ['1ère Année', '2ème Année', '3ème Année', '4ème Année', '5ème Année'];
  readonly diplomes = ['Ingénieur', 'Master', 'Licence', 'Doctorat', 'BTS', 'Technicien Spécialisé', 'Technicien', 'Qualification'];

  private api = `${environment.apiUrl}/stagiaires`;
  readonly FORM_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=3Jxd65d97UKC3kHby7aY-x9bJi2qZVdHsytozfGb1bBUNE1ZQ1AzRVVHUzdKMlVJVUE3T0dLRFhSWSQlQCN0PWcu&origin=QRCode';

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom:               ["", Validators.required],
      prenom:            ["", Validators.required],
      cin:               ["", Validators.required],
      telephone:         ["", Validators.required],
      email:             ["", [Validators.required, Validators.email]],
      filiere:           ["", Validators.required],
      niveau:            ["", Validators.required],
      diplome:           ["", Validators.required],
      dateDebut:         [""],
      dateFin:           [""],
      adressePersonnelle:   ["", Validators.required],
      villeEtablissement:   ["", Validators.required],
      adresseLogementStage: ["", Validators.required],
      contactUrgenceNom:    ["", Validators.required],
      contactUrgenceTel:    ["", Validators.required],
      serviceAccueil:       [""],
      observation:          [""],
      reglesAcceptees:      [false, Validators.requiredTrue],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['profil'] && this.profil && this.form) {
    this.form.patchValue({
      nom:      this.profil.nom ?? '',
      prenom:   this.profil.prenom ?? '',
      cin:      this.profil.cin ?? '',
      telephone: this.profil.telephone ?? '',
      email:    this.profil.email ?? '',
      filiere:  this.profil.filiere ?? '',
      niveau:   this.profil.niveau ?? '',
      diplome:  this.profil.diplome ?? '',
    });
    this.isCompleted = this.profil.ficheRenseignementCompletee === true;
  }
  if (changes['stage'] && this.stage && this.form) {
    this.form.patchValue({
      dateDebut: this.stage.dateDebut ?? '',
      dateFin:   this.stage.dateFin ?? '',
    });
  }
}

  get progressPercent(): number {
    const fields = Object.keys(this.form.controls);
    const filled = fields.filter(k => {
      const v = this.form.get(k)?.value;
      return v !== null && v !== '' && v !== false;
    });
    return Math.round((filled.length / fields.length) * 100);
  }

  sauvegarder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('⚠️ Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }
    this.isSubmitting = true;
    this.http.patch(`${this.api}/ma-fiche`, this.form.value).subscribe({
      next: () => {
        this.isCompleted = true;
        this.isSubmitting = false;
        this.snackBar.open('✅ Fiche enregistrée avec succès !', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('❌ Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
      }
    });
  }

  ouvrirFormulaireOCP(): void {
    window.open(this.FORM_URL, '_blank');
  }
}