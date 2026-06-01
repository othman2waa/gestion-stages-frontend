export interface DocumentStagiaireResponse {
  id: number;
  typeDocument: string;
  nomFichier: string;
  contentType: string;
  taille: number;
  uploadedAt: string;
}

export const TYPES_DOCUMENTS = [
  { value: 'CV', label: 'CV', icon: 'description', accept: '.pdf,.doc,.docx' },
  { value: 'CIN', label: 'Carte d\'identité', icon: 'badge', accept: '.pdf,.jpg,.jpeg,.png' },
  { value: 'PHOTO', label: 'Photo d\'identité', icon: 'photo_camera', accept: '.jpg,.jpeg,.png' },
  { value: 'DIPLOME', label: 'Diplôme', icon: 'school', accept: '.pdf,.jpg,.jpeg,.png' },
  { value: 'ASSURANCE', label: 'Assurance', icon: 'health_and_safety', accept: '.pdf' },
  { value: 'AUTRE', label: 'Autre document', icon: 'attach_file', accept: '*' }
];
