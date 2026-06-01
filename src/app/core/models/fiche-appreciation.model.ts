export interface FicheStageRequest {
  stageId: number;
  noteGlobale: number;
  qualiteTravail: number;
  respectDelais: number;
  initiative: number;
  qualiteRapport: number;
  competencesTechniques: number;
  recommandation: string;
  commentaires?: string;
}

export interface FicheStageResponse {
  id: number;
  stageId: number;
  stageSujet: string;
  stagiaireNom: string;
  encadrantId: number;
  encadrantNom: string;
  noteGlobale: number;
  qualiteTravail: number;
  respectDelais: number;
  initiative: number;
  qualiteRapport: number;
  competencesTechniques: number;
  recommandation: string;
  commentaires: string;
  moyenneGenerale: number;
  createdAt: string;
}

export interface FicheStagiaireRequest {
  stageId: number;
  assiduite: number;
  ponctualite: number;
  comportementProfessionnel: number;
  espritEquipe: number;
  communication: number;
  adaptation: number;
  recommandationEmbauche: string;
  commentaires?: string;
}

export interface FicheStagiaireResponse {
  id: number;
  stageId: number;
  stageSujet: string;
  stagiaireNom: string;
  encadrantId: number;
  encadrantNom: string;
  assiduite: number;
  ponctualite: number;
  comportementProfessionnel: number;
  espritEquipe: number;
  communication: number;
  adaptation: number;
  recommandationEmbauche: string;
  commentaires: string;
  moyenneGenerale: number;
  createdAt: string;
}
