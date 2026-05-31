export interface DepartementResponse {
  id: number;
  code: string;
  nom: string;
  responsable: string;
  description: string;
  email: string;
  telephone: string;
  localisation: string;
  actif: boolean;
  createdAt: string;
  nombreEncadrants: number;
  nombreStages: number;
  nombreStagesEnCours: number;
  nombreStagiaires: number;
}
