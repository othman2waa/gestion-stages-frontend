import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportExcel(data: any[], fileName: string, sheetName: string = 'Data'): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Style header
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '00843D' } },
        alignment: { horizontal: 'center' }
      };
    }

    // Auto width
    const colWidths = data.reduce((acc: any[], row: any) => {
      Object.keys(row).forEach((key, i) => {
        const val = row[key] ? row[key].toString() : '';
        acc[i] = Math.max(acc[i] || key.length, val.length);
      });
      return acc;
    }, []);
    ws['!cols'] = colWidths.map((w: number) => ({ wch: Math.min(w + 2, 40) }));

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportCandidatures(candidatures: any[]): void {
    const data = candidatures.map(c => ({
      'Prénom': c.prenom,
      'Nom': c.nom,
      'Email': c.email,
      'Téléphone': c.telephone ?? '',
      'Filière': c.filiere ?? '',
      'Niveau': c.niveau ?? '',
      'Établissement': c.etablissement ?? '',
      'Département souhaité': c.departementSouhaite ?? '',
      'Sujet souhaité': c.sujetSouhaite ?? '',
      'Statut': c.statut,
      'Score Matching (%)': c.scoreMatching ?? 0,
      'CV Joint': c.hasCv ? 'Oui' : 'Non',
      'Date candidature': c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : '',
      'Traité par': c.traitePar ?? '',
      'Date traitement': c.traiteAt ? new Date(c.traiteAt).toLocaleDateString('fr-FR') : '',
      'Commentaire RH': c.commentaireRh ?? ''
    }));
    this.exportExcel(data, 'candidatures', 'Candidatures');
  }

  exportStages(stages: any[]): void {
    const data = stages.map(s => ({
      'Sujet': s.sujet,
      'Type': s.typeStage ?? '',
      'Statut': s.statut,
      'Stagiaire': s.stagiaireNom ?? '',
      'Encadrant': s.encadrantNom ?? '',
      'Département': s.departementNom ?? '',
      'Date début': s.dateDebut ? new Date(s.dateDebut).toLocaleDateString('fr-FR') : '',
      'Date fin': s.dateFin ? new Date(s.dateFin).toLocaleDateString('fr-FR') : '',
      'Créé le': s.createdAt ? new Date(s.createdAt).toLocaleDateString('fr-FR') : ''
    }));
    this.exportExcel(data, 'stages', 'Stages');
  }

  exportStagiaires(stagiaires: any[]): void {
    const data = stagiaires.map(s => ({
      'Prénom': s.prenom,
      'Nom': s.nom,
      'Email': s.email,
      'Téléphone': s.telephone ?? '',
      'CIN': s.cin ?? '',
      'Filière': s.filiere ?? '',
      'Niveau': s.niveau ?? '',
      'Établissement': s.etablissementNom ?? '',
      'Username': s.username ?? '',
      'Compte actif': s.actif ? 'Oui' : 'Non',
      'Créé le': s.createdAt ? new Date(s.createdAt).toLocaleDateString('fr-FR') : ''
    }));
    this.exportExcel(data, 'stagiaires', 'Stagiaires');
  }

  exportEvaluations(evaluations: any[]): void {
    const data = evaluations.map(e => ({
      'Stage': e.stageSujet ?? '',
      'Stagiaire': e.stagiaireNom ?? '',
      'Encadrant': e.encadrantNom ?? '',
      'Type': e.typeEvaluation ?? '',
      'Note /20': e.note ?? '',
      'Commentaire': e.commentaire ?? '',
      'Date': e.dateEval ? new Date(e.dateEval).toLocaleDateString('fr-FR') : ''
    }));
    this.exportExcel(data, 'evaluations', 'Evaluations');
  }
}