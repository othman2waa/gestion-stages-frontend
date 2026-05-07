import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';

interface DocumentType {
  type: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  file?: File;
  uploaded?: boolean;
  uploading?: boolean;
}

@Component({
  selector: 'app-documents-upload',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule,
    MatProgressBarModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './documents-upload.component.html',
  styleUrls: ['./documents-upload.component.scss']
})
export class DocumentsUploadComponent implements OnInit {

  candidatureId: number | null = null;
  documents: DocumentType[] = [
    {
      type: 'CONVENTION_ETABLISSEMENT',
      label: 'Convention de stage',
      description: 'Convention signée par votre établissement (scan PDF)',
      icon: 'description',
      color: '#1E40AF'
    },
    {
      type: 'ASSURANCE',
      label: 'Attestation d\'assurance',
      description: 'Attestation d\'assurance stage (scan PDF)',
      icon: 'security',
      color: '#00843D'
    },
    {
      type: 'CIN',
      label: 'Carte d\'identité',
      description: 'CIN recto/verso (scan PDF)',
      icon: 'badge',
      color: '#7C3AED'
    },
    {
      type: 'CV',
      label: 'CV',
      description: 'Votre CV à jour (PDF)',
      icon: 'person',
      color: '#F47920'
    }
  ];

  existingDocs: any[] = [];
  isLoading = false;

  get uploadedCount(): number {
    return this.documents.filter(d => d.uploaded).length;
  }

  get allUploaded(): boolean {
    return this.uploadedCount === this.documents.length;
  }

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Récupérer candidatureId depuis le profil stagiaire
    this.http.get<any>('http://localhost:8080/api/stagiaires/mon-profil').subscribe({
      next: (profil) => {
        if (profil.candidatureId) {
          this.candidatureId = profil.candidatureId;
          this.loadExistingDocs();
        }
      },
      error: () => {}
    });
  }

  loadExistingDocs(): void {
    if (!this.candidatureId) return;
    this.http.get<any[]>(`http://localhost:8080/api/candidatures/${this.candidatureId}/documents`).subscribe({
      next: (docs) => {
        this.existingDocs = docs;
        // Marquer les documents déjà uploadés
        docs.forEach(d => {
          const found = this.documents.find(doc => doc.type === d.typeDocument);
          if (found) found.uploaded = true;
        });
      },
      error: () => {}
    });
  }

  onFileSelected(event: any, doc: DocumentType): void {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.snackBar.open('❌ Veuillez sélectionner un fichier PDF', 'Fermer', { duration: 3000 });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('❌ Fichier trop volumineux (max 5MB)', 'Fermer', { duration: 3000 });
      return;
    }
    doc.file = file;
    this.uploadDocument(doc);
  }

  uploadDocument(doc: DocumentType): void {
    if (!doc.file || !this.candidatureId) return;
    doc.uploading = true;

    const formData = new FormData();
    formData.append('type', doc.type);
    formData.append('fichier', doc.file);

    this.http.post(
      `http://localhost:8080/api/candidatures/${this.candidatureId}/upload-document`,
      formData
    ).subscribe({
      next: (res: any) => {
        doc.uploading = false;
        doc.uploaded = true;
        this.snackBar.open(`✅ ${doc.label} uploadé avec succès`, 'Fermer', { duration: 3000 });
        if (res.nbDocuments >= 4) {
          this.snackBar.open(
            '🎉 Tous les documents envoyés ! Le RH va vérifier votre dossier.',
            'Fermer', { duration: 5000 }
          );
        }
      },
      error: () => {
        doc.uploading = false;
        this.snackBar.open(`❌ Erreur upload ${doc.label}`, 'Fermer', { duration: 3000 });
      }
    });
  }
}