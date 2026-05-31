export interface AnnonceResponse {
  id: number;
  titre: string;
  description: string;
  competencesRequises: string;
  departement: string;
  typeStage: string;
  niveauRequis: string;
  filiereRequise: string;
  nombrePostes: number;
  dateLimite: string;
  actif: boolean;
  createdAt: string;
  createdPar: string;
  nombreCandidatures: number;
}
