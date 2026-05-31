import { ConventionStatus } from './enums.model';

export interface ConventionResponse {
  id: number;
  stageId: number;
  stageSujet: string;
  numero: string;
  statut: ConventionStatus;
  cheminFichier: string;
  dateEmission: string;
  createdAt: string;
  stagiaireNom: string;
  stagiaireEmail: string;
  stagiaireCin: string;
  stagiaireFiliere: string;
  stagiaireNiveau: string;
  stagiaireEtablissement: string;
  encadrantNom: string;
  encadrantEmail: string;
  departementNom: string;
  stageDebut: string;
  stageFin: string;
  typeStage: string;
}
