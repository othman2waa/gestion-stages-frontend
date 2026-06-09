import { Pipe, PipeTransform } from '@angular/core';

/**
 * Traduit les codes techniques (statuts, rôles, types de stage) en libellés lisibles.
 * Usage : {{ candidature.statut | statutLabel }}
 * Fallback : remplace les "_" et met en forme si le code est inconnu.
 */
@Pipe({ name: 'statutLabel', standalone: true })
export class StatutLabelPipe implements PipeTransform {

  private static readonly LABELS: Record<string, string> = {
    // ── Candidature ──
    EN_ATTENTE: 'En attente',
    VU_ENCADRANT: 'Vu par l’encadrant',
    MEETING_PLANIFIE: 'Entretien planifié',
    ACCEPTEE_ENCADRANT: 'Accepté (encadrant)',
    REFUSEE_ENCADRANT: 'Refusé (encadrant)',
    DOCUMENTS_REQUIS: 'Documents requis',
    DOCUMENTS_SOUMIS: 'Documents soumis',
    VERIFICATION_IA: 'Vérification IA',
    ACCEPTEE_RH: 'Validé RH',
    REFUSEE_RH: 'Refusé RH',
    CONVOCATION_ENVOYEE: 'Convocation envoyée',
    ACCEPTEE: 'Accepté',
    REFUSEE: 'Refusé',

    // ── Stage ──
    DEMANDE_SOUMISE: 'Demande soumise',
    EN_ATTENTE_VALIDATION: 'En attente de validation',
    VALIDEE: 'Validé',
    CONVENTION_GENEREE: 'Convention générée',
    CONVENTION_SIGNEE: 'Convention signée',
    EN_COURS: 'En cours',
    EN_ATTENTE_EVALUATION: 'À évaluer',
    FIN_STAGE: 'Fin de stage',
    TERMINE: 'Terminé',
    ANNULE: 'Annulé',
    REJETEE: 'Rejeté',

    // ── Convention ──
    EN_VALIDATION: 'En validation',
    GENEREE: 'Générée',
    SIGNEE: 'Signée',
    ARCHIVEE: 'Archivée',

    // ── Attestation ──
    APPROUVEE: 'Approuvée',

    // ── Sujet de stage ──
    DISPONIBLE: 'Disponible',
    AFFECTE: 'Affecté',
    VALIDE: 'Validé',
    REFUSE: 'Refusé',

    // ── Rôles ──
    ADMIN_RH: 'Administrateur RH',
    RESPONSABLE_RH: 'Responsable RH',
    ENCADRANT: 'Encadrant',
    STAGIAIRE: 'Stagiaire',

    // ── Type de stage ──
    PFE: 'PFE',
    PFA: 'PFA',
    OBSERVATION: 'Stage d’observation',
    INITIATION: 'Stage d’initiation',
    PERFECTIONNEMENT: 'Perfectionnement',
  };

  transform(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const key = value.toString().toUpperCase();
    const label = StatutLabelPipe.LABELS[key];
    if (label) return label;
    // Fallback : "MON_CODE" -> "Mon code"
    const s = key.replace(/_/g, ' ').toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
