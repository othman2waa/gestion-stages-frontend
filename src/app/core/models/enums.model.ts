export type StageStatus =
  | 'EN_ATTENTE'
  | 'DEMANDE_SOUMISE'
  | 'EN_ATTENTE_VALIDATION'
  | 'VALIDEE'
  | 'REJETEE'
  | 'CONVENTION_GENEREE'
  | 'CONVENTION_SIGNEE'
  | 'EN_COURS'
  | 'EN_ATTENTE_EVALUATION'
  | 'TERMINE'
  | 'ANNULE';

export type TypeStage =
  | 'PFE'
  | 'PFA'
  | 'STAGE_ETE'
  | 'STAGE_OBSERVATION';

export type ConventionStatus =
  | 'BROUILLON'
  | 'EN_VALIDATION'
  | 'SIGNEE'
  | 'ARCHIVEE';

export type TypeEvaluation =
  | 'MI_PARCOURS'
  | 'FIN_STAGE';

export type UserRole =
  | 'ADMIN_RH'
  | 'RESPONSABLE_RH'
  | 'ENCADRANT'
  | 'STAGIAIRE';

export type CandidatureStatut =
  | 'EN_ATTENTE'
  | 'ACCEPTEE'
  | 'REFUSEE';

export type AttestationStatut =
  | 'EN_ATTENTE'
  | 'VALIDEE'
  | 'REFUSEE';

export type SujetStatut =
  | 'EN_ATTENTE'
  | 'VALIDE'
  | 'REFUSE'
  | 'AFFECTE';
