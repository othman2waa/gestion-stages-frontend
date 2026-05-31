import { SujetStatut } from './enums.model';

export interface SujetStageResponse {
  id: number;
  titre: string;
  description: string;
  technologies: string;
  niveauRequis: string;
  typeStage: string;
  statut: SujetStatut;
  encadrantId: number;
  encadrantNom: string;
  departementNom: string;
  stageId: number;
  validatedBy: string;
  createdAt: string;
}
