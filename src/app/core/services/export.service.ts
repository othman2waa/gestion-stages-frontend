import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CandidatureResponse, StageResponse, EvaluationResponse, StagiaireResponse, EncadrantResponse, ConventionResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ExportService {

exportCandidaturesPdf(candidatures: CandidatureResponse[]): void {
  const doc = new jsPDF();

  // Header OCP
  doc.setFillColor(0, 132, 61);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OCP Group — Rapport des Candidatures', 14, 16);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 33);
  doc.text(`Total : ${candidatures.length} candidature(s)`, 14, 39);

  const accepted = candidatures.filter(c => c.statut === 'ACCEPTEE').length;
  const refused = candidatures.filter(c => c.statut === 'REFUSEE').length;
  const pending = candidatures.filter(c => c.statut === 'EN_ATTENTE').length;
  doc.text(`Acceptées: ${accepted} | Refusées: ${refused} | En attente: ${pending}`, 14, 45);

  autoTable(doc, {
    startY: 52,
    head: [['Nom', 'Email', 'Filière', 'Niveau', 'Statut', 'Score', 'Date']],
    body: candidatures.map(c => [
      `${c.prenom} ${c.nom}`,
      c.email,
      c.filiere ?? '—',
      c.niveau ?? '—',
      c.statut,
      `${c.scoreMatching ?? 0}%`,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : '—'
    ]),
    headStyles: { fillColor: [0, 132, 61], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 9, cellPadding: 3 },
 columnStyles: {
  4: { cellWidth: 25 }
}
  });

  doc.save(`candidatures_${new Date().toISOString().split('T')[0]}.pdf`);
}

exportStagesPdf(stages: StageResponse[]): void {
  const doc = new jsPDF('landscape');

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 297, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OCP Group — Rapport des Stages', 14, 16);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} | Total : ${stages.length} stage(s)`, 14, 33);

  autoTable(doc, {
    startY: 40,
    head: [['Sujet', 'Stagiaire', 'Encadrant', 'Type', 'Département', 'Statut', 'Début', 'Fin']],
    body: stages.map(s => [
      s.sujet,
      s.stagiaireNom ?? '—',
      s.encadrantNom ?? '—',
      s.typeStage ?? '—',
      s.departementNom ?? '—',
      s.statut,
      s.dateDebut ? new Date(s.dateDebut).toLocaleDateString('fr-FR') : '—',
      s.dateFin ? new Date(s.dateFin).toLocaleDateString('fr-FR') : '—'
    ]),
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  doc.save(`stages_${new Date().toISOString().split('T')[0]}.pdf`);
}

exportEvaluationsPdf(evaluations: EvaluationResponse[]): void {
  const doc = new jsPDF();

  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OCP Group — Rapport des Évaluations', 14, 16);

  const moyenne = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + (e.note ?? 0), 0) / evaluations.length
    : 0;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 33);
  doc.text(`Total : ${evaluations.length} évaluation(s) | Moyenne : ${moyenne.toFixed(1)}/20`, 14, 39);

  autoTable(doc, {
    startY: 46,
    head: [['Stage', 'Stagiaire', 'Encadrant', 'Type', 'Note /20', 'Mention', 'Date']],
    body: evaluations.map(e => [
      e.stageSujet ?? '—',
      e.stagiaireNom ?? '—',
      e.encadrantNom ?? '—',
      e.typeEvaluation ?? '—',
      e.note ?? '—',
      e.note >= 16 ? 'Excellent' : e.note >= 12 ? 'Bien' : e.note >= 10 ? 'Passable' : 'Insuffisant',
      e.dateEval ? new Date(e.dateEval).toLocaleDateString('fr-FR') : '—'
    ]),
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save(`evaluations_${new Date().toISOString().split('T')[0]}.pdf`);
}

exportStagiairesPdf(stagiaires: StagiaireResponse[]): void {
  const doc = new jsPDF();

  doc.setFillColor(0, 132, 61);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OCP Group — Liste des Stagiaires', 14, 16);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} | Total : ${stagiaires.length}`, 14, 33);

  autoTable(doc, {
    startY: 40,
    head: [['Prénom', 'Nom', 'Email', 'Filière', 'Niveau', 'Établissement', 'Compte']],
    body: stagiaires.map(s => [
      s.prenom,
      s.nom,
      s.email,
      s.filiere ?? '—',
      s.niveau ?? '—',
      s.etablissementNom ?? '—',
      s.actif ? 'Actif' : 'Inactif'
    ]),
    headStyles: { fillColor: [0, 132, 61], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  doc.save(`stagiaires_${new Date().toISOString().split('T')[0]}.pdf`);
}


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

  exportCandidatures(candidatures: CandidatureResponse[]): void {
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

  exportStages(stages: StageResponse[]): void {
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

  exportStagiaires(stagiaires: StagiaireResponse[]): void {
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

  exportEncadrants(encadrants: EncadrantResponse[]): void {
    const data = encadrants.map(e => ({
      'Prénom': e.prenom,
      'Nom': e.nom,
      'Email': e.email,
      'Fonction': e.fonction ?? '',
      'Département': e.departementNom ?? '',
      'Créé le': e.createdAt ? new Date(e.createdAt).toLocaleDateString('fr-FR') : ''
    }));
    this.exportExcel(data, 'encadrants', 'Encadrants');
  }

  exportEncadrantsPdf(encadrants: EncadrantResponse[]): void {
    const doc = new jsPDF();

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('OCP Group — Liste des Encadrants', 14, 16);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} | Total : ${encadrants.length}`, 14, 33);

    autoTable(doc, {
      startY: 40,
      head: [['Prénom', 'Nom', 'Email', 'Fonction', 'Département']],
      body: encadrants.map(e => [
        e.prenom, e.nom, e.email,
        e.fonction ?? '—', e.departementNom ?? '—'
      ]),
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    doc.save(`encadrants_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportConventions(conventions: ConventionResponse[]): void {
    const data = conventions.map(c => ({
      'Numéro': c.numero ?? '',
      'Stage': c.stageSujet ?? '',
      'Stagiaire': c.stagiaireNom ?? '',
      'Encadrant': c.encadrantNom ?? '',
      'Département': c.departementNom ?? '',
      'Statut': c.statut ?? '',
      'Type stage': c.typeStage ?? '',
      'Date émission': c.dateEmission ? new Date(c.dateEmission).toLocaleDateString('fr-FR') : '',
      'Début stage': c.stageDebut ? new Date(c.stageDebut).toLocaleDateString('fr-FR') : '',
      'Fin stage': c.stageFin ? new Date(c.stageFin).toLocaleDateString('fr-FR') : ''
    }));
    this.exportExcel(data, 'convocations', 'Convocations');
  }

  exportConventionsPdf(conventions: ConventionResponse[]): void {
    const doc = new jsPDF('landscape');

    doc.setFillColor(0, 132, 61);
    doc.rect(0, 0, 297, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('OCP Group — Rapport des Convocations', 14, 16);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const signees = conventions.filter(c => c.statut === 'SIGNEE').length;
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} | Total : ${conventions.length} | Signées : ${signees}`, 14, 33);

    autoTable(doc, {
      startY: 40,
      head: [['Numéro', 'Stage', 'Stagiaire', 'Encadrant', 'Département', 'Statut', 'Émission']],
      body: conventions.map(c => [
        c.numero ?? '—', c.stageSujet ?? '—', c.stagiaireNom ?? '—',
        c.encadrantNom ?? '—', c.departementNom ?? '—', c.statut ?? '—',
        c.dateEmission ? new Date(c.dateEmission).toLocaleDateString('fr-FR') : '—'
      ]),
      headStyles: { fillColor: [0, 132, 61], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`convocations_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportEvaluations(evaluations: EvaluationResponse[]): void {
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