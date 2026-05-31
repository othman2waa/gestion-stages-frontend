import { StageStatus, TypeStage } from './enums.model';

export interface StageResponse {
  id: number;
  sujet: string;
  typeStage: TypeStage;
  statut: StageStatus;
  dateDebut: string;
  dateFin: string;
  stagiaireId: number;
  stagiaireNom: string;
  encadrantId: number;
  encadrantNom: string;
  departementId: number;
  departementNom: string;
  createdAt: string;
}

export interface StageRequest {
  sujet: string;
  typeStage: TypeStage;
  dateDebut: string;
  dateFin: string;
  stagiaireId?: number;
  encadrantId?: number;
  departementId?: number;
}

export interface StageHistoriqueResponse {
  id: number;
  statutPrecedent: StageStatus;
  statutNouveau: StageStatus;
  commentaire: string;
  modifiePar: string;
  dateModification: string;
}
