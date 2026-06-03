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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DepartementService } from '../core/services/departement.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatProgressBarModule,
    MatTooltipModule, MatChipsModule
  ],
  templateUrl: './departements.component.html',
  styleUrls: ['./departements.component.scss']
})
export class DepartementsComponent implements OnInit {
  @ViewChild('formDialog') formDialog!: TemplateRef<any>;
  @ViewChild('detailDialog') detailDialog!: TemplateRef<any>;

  departements: any[] = [];
  filteredDepartements: any[] = [];
  isLoading = true;
  searchKeyword = '';
  editingId: number | null = null;
  selectedDept: any = null;
  stagiairesByDept: any[] = [];
  encadrantsByDept: any[] = [];
  loadingMembers = false;

  form: FormGroup;

  get totalEncadrants(): number {
    return this.departements.reduce((s, d) => s + (d.nombreEncadrants ?? 0), 0);
  }
  get totalStages(): number {
    return this.departements.reduce((s, d) => s + (d.nombreStages ?? 0), 0);
  }
  get totalEnCours(): number {
    return this.departements.reduce((s, d) => s + (d.nombreStagesEnCours ?? 0), 0);
  }

  constructor(
    private deptService: DepartementService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      nom: ['', Validators.required],
      responsable: [''],
      description: [''],
      email: ['', Validators.email],
      telephone: [''],
      localisation: [''],
      actif: [true]
    });
  }

  ngOnInit(): void { this.loadDepartements(); }

  loadDepartements(): void {
    this.isLoading = true;
    this.deptService.getAll().subscribe({
      next: (data) => {
        this.departements = data;
        this.filteredDepartements = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void {
    const kw = this.searchKeyword.toLowerCase();
    this.filteredDepartements = this.departements.filter(d =>
      d.nom?.toLowerCase().includes(kw) ||
      d.code?.toLowerCase().includes(kw) ||
      d.responsable?.toLowerCase().includes(kw)
    );
  }

  openForm(dept?: any): void {
    this.editingId = dept?.id ?? null;
    if (dept) {
      this.form.patchValue(dept);
    } else {
      this.form.reset({ actif: true });
    }
    this.dialog.open(this.formDialog, { width: '620px' });
  }

  save(): void {
    if (this.form.invalid) return;
    const obs = this.editingId
      ? this.deptService.update(this.editingId, this.form.value)
      : this.deptService.create(this.form.value);
    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? '✅ Département modifié' : '✅ Département créé', 'Fermer', { duration: 3000 });
        this.dialog.closeAll();
        this.loadDepartements();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Erreur', 'Fermer', { duration: 3000 })
    });
  }

  voirDetail(d: any): void {
    this.selectedDept = d;
    this.dialog.open(this.detailDialog, { width: '560px' });
  }

  toggle(d: any): void {
    const action = d.actif ? 'désactiver' : 'activer';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: d.actif ? 'Désactiver le département' : 'Activer le département',
        message: `Voulez-vous ${action} le département « ${d.nom} » ?`,
        confirmText: d.actif ? 'Désactiver' : 'Activer'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.deptService.toggle(d.id).subscribe({
        next: () => {
          d.actif = !d.actif;
          this.snackBar.open(d.actif ? 'Département activé' : 'Département désactivé', 'Fermer', { duration: 3000 });
        }
      });
    });
  }

  delete(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Suppression', message: 'Supprimer ce département ?', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.deptService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Département supprimé', 'Fermer', { duration: 3000 });
          this.loadDepartements();
        },
        error: () => this.snackBar.open('Erreur — des encadrants ou stages sont liés', 'Fermer', { duration: 4000 })
      });
    });
  }

  getInitials(nom: string): string {
    return nom?.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2) ?? '??';
  }
@ViewChild('membresDialog') membresDialog!: TemplateRef<any>;
loadMembres(dept: any): void {
  this.selectedDept = dept;
  this.loadingMembers = true;
  this.http.get<any[]>(`${environment.apiUrl}/departements/${dept.id}/stagiaires`).subscribe({
    next: (data) => { this.stagiairesByDept = data; this.loadingMembers = false; },
    error: () => this.loadingMembers = false
  });
  this.http.get<any[]>(`${environment.apiUrl}/departements/${dept.id}/encadrants`).subscribe({
    next: (data) => this.encadrantsByDept = data,
    error: () => {}
  });
  this.dialog.open(this.membresDialog, { width: '700px' });
}

}