export interface SuiviResponse {
  id: number;
  stageId: number;
  stageSujet: string;
  stagiaireNom: string;
  encadrantNom: string;
  semaineNumero: number;
  dateSuivi: string;
  progression: number;
  commentaire: string;
  pointsPositifs: string;
  axesAmelioration: string;
  note: number;
  createdAt: string;
  joursPresents: number;
  joursAbsences: number;
  motifAbsence: string;
  tachesAssignees: string;
  tachesCompletees: string;
  tauxCompletionTaches: number;
}

export interface SuiviRequest {
  stageId: number;
  semaineNumero: number;
  dateSuivi: string;
  progression: number;
  commentaire?: string;
  pointsPositifs?: string;
  axesAmelioration?: string;
  note?: number;
  joursPresents?: number;
  joursAbsences?: number;
  motifAbsence?: string;
  tachesAssignees?: string;
  tachesCompletees?: string;
  tauxCompletionTaches?: number;
}
