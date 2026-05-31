import { AttestationStatut } from './enums.model';

export interface AttestationResponse {
  id: number;
  statut: AttestationStatut;
  dateDemande: string;
  dateTraitement: string;
  traitePar: string;
  numeroAttestation: string;
  commentaire: string;
  stageId: number;
  stageSujet: string;
  stagiaireNom: string;
}
