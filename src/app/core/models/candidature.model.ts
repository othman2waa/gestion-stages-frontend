import { CandidatureStatut } from './enums.model';

export interface CandidatureResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  filiere: string;
  niveau: string;
  etablissement: string;
  sujetSouhaite: string;
  departementSouhaite: string;
  departementNom: string;
  departementId: number;
  message: string;
  statut: CandidatureStatut;
  commentaireRh: string;
  cvNomFichier: string;
  hasCv: boolean;
  createdAt: string;
  traiteAt: string;
  traitePar: string;
  scoreMatching: number;
  annonceId: number;
}

export interface TraiterCandidatureRequest {
  statut: CandidatureStatut;
  commentaireRh?: string;
}
