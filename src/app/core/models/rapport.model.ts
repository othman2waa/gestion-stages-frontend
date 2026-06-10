export interface RapportResponse {
  id: number;
  stageId: number;
  stageSujet: string;
  stagiaireNom: string;
  nomFichier: string;
  typeContenu: string;
  taille: number;
  uploadedAt: string;
  statut?: string;                 // EN_ATTENTE, VALIDE, REFUSE
  commentaireValidation?: string;
  valideAt?: string;
}
