import { TypeEvaluation } from './enums.model';

export interface EvaluationResponse {
  id: number;
  stageId: number;
  stageSujet: string;
  encadrantId: number;
  encadrantNom: string;
  stagiaireNom: string;
  note: number;
  commentaire: string;
  typeEvaluation: TypeEvaluation;
  dateEval: string;
  createdAt: string;
}
