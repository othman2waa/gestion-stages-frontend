import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PointageService } from '../core/services/pointage.service';
import { StageService } from '../core/services/stage.service';
import { AuthService } from '../core/services/auth.service';

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNum: number;
  isWeekend: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface CalendarMonth {
  label: string;
  weeks: CalendarDay[][];
}

interface StagiaireInfo {
  stageId: number;
  stagiaireNom: string;
  sujet: string;
  dateDebut: string;
  dateFin: string;
  departementNom: string;
  typeStage: string;
  statut: string;
}

@Component({
  selector: 'app-suivi-hebdomadaire',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatProgressBarModule, MatTooltipModule
  ],
  templateUrl: './suivi-hebdomadaire.component.html',
  styleUrls: ['./suivi-hebdomadaire.component.scss']
})
export class SuiviHebdomadaireComponent implements OnInit {

  // Data
  stagiaires: StagiaireInfo[] = [];
  isLoading = false;
  userRole = '';

  // Search
  searchTerm = '';

  // Selected stagiaire & calendar
  selectedStagiaire: StagiaireInfo | null = null;
  calendarMonths: CalendarMonth[] = [];
  pointageMap = new Map<string, { present: boolean; motif: string }>();
  savingPointage = false;

  // Computed
  get isEncadrant(): boolean { return this.userRole === 'ENCADRANT'; }

  get filteredStagiaires(): StagiaireInfo[] {
    if (!this.searchTerm) return this.stagiaires;
    const kw = this.searchTerm.toLowerCase();
    return this.stagiaires.filter(s =>
      s.stagiaireNom.toLowerCase().includes(kw) ||
      s.sujet.toLowerCase().includes(kw)
    );
  }

  get pointageStats(): { presents: number; absents: number; total: number; rate: number } {
    let presents = 0;
    let absents = 0;
    this.pointageMap.forEach(v => {
      if (v.present) presents++;
      else absents++;
    });
    const total = presents + absents;
    const rate = total > 0 ? Math.round((presents / total) * 100) : 0;
    return { presents, absents, total, rate };
  }

  constructor(
    private pointageService: PointageService,
    private stageService: StageService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole() ?? '';
    this.loadStagiaires();
  }

  loadStagiaires(): void {
    this.isLoading = true;
    const obs = this.isEncadrant
      ? this.stageService.getMesStages()
      : this.stageService.getAll();

    obs.subscribe({
      next: (data: any[]) => {
        this.stagiaires = data
          .filter((s: any) => s.stagiaireNom)
          .map((s: any) => ({
            stageId: s.id,
            stagiaireNom: s.stagiaireNom ?? 'Stagiaire',
            sujet: s.sujet ?? '',
            dateDebut: s.dateDebut,
            dateFin: s.dateFin,
            departementNom: s.departementNom ?? '',
            typeStage: s.typeStage ?? '',
            statut: s.statut ?? ''
          }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // ─── Stagiaire selection ───

  selectStagiaire(s: StagiaireInfo): void {
    this.selectedStagiaire = s;
    if (!s.dateDebut || !s.dateFin) {
      this.calendarMonths = [];
      return;
    }
    this.generateCalendar(new Date(s.dateDebut), new Date(s.dateFin));
    this.loadPointages(s.stageId);
  }

  backToList(): void {
    this.selectedStagiaire = null;
    this.calendarMonths = [];
    this.pointageMap.clear();
  }

  // ─── Calendar ───

  generateCalendar(start: Date, end: Date): void {
    this.calendarMonths = [];
    this.pointageMap.clear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const current = new Date(start);
    let currentMonthIdx = -1;
    let currentWeek: CalendarDay[] = [];

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = this.formatDate(current);

      const day: CalendarDay = {
        date: new Date(current),
        dateStr,
        dayNum: current.getDate(),
        isWeekend,
        isToday: current.getTime() === today.getTime(),
        isFuture: current > today
      };

      // New month
      if (current.getMonth() !== currentMonthIdx) {
        // Push remaining week to previous month
        if (currentWeek.length > 0 && this.calendarMonths.length > 0) {
          this.calendarMonths[this.calendarMonths.length - 1].weeks.push(currentWeek);
          currentWeek = [];
        }
        currentMonthIdx = current.getMonth();
        this.calendarMonths.push({
          label: current.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          weeks: []
        });
      }

      currentWeek.push(day);

      // Default work days as present (not future)
      if (!isWeekend && !day.isFuture) {
        this.pointageMap.set(dateStr, { present: true, motif: '' });
      }

      // End of week (Sunday) or end of range
      if (dayOfWeek === 0 || current.getTime() === end.getTime()) {
        if (this.calendarMonths.length > 0 && currentWeek.length > 0) {
          this.calendarMonths[this.calendarMonths.length - 1].weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0 && this.calendarMonths.length > 0) {
      this.calendarMonths[this.calendarMonths.length - 1].weeks.push(currentWeek);
    }
  }

  loadPointages(stageId: number): void {
    this.pointageService.getByStage(stageId).subscribe({
      next: (data) => {
        data.forEach(p => {
          this.pointageMap.set(p.date, { present: p.present, motif: p.motif ?? '' });
        });
      }
    });
  }

  toggleDay(day: CalendarDay): void {
    if (day.isWeekend || day.isFuture) return;
    const existing = this.pointageMap.get(day.dateStr);
    if (existing) {
      existing.present = !existing.present;
      if (existing.present) existing.motif = '';
    } else {
      this.pointageMap.set(day.dateStr, { present: false, motif: '' });
    }
  }

  getDayStatus(dateStr: string): string {
    const entry = this.pointageMap.get(dateStr);
    if (!entry) return 'unmarked';
    return entry.present ? 'present' : 'absent';
  }

  getEmptySlots(week: CalendarDay[]): number[] {
    if (!week.length) return [];
    const firstDay = week[0].date.getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday=0
    return new Array(offset).fill(0);
  }

  savePointages(): void {
    if (!this.selectedStagiaire) return;
    this.savingPointage = true;

    const pointages: { date: string; present: boolean; motif: string }[] = [];
    this.pointageMap.forEach((value, key) => {
      pointages.push({ date: key, present: value.present, motif: value.motif });
    });

    this.pointageService.saveBulk({
      stageId: this.selectedStagiaire.stageId,
      pointages
    }).subscribe({
      next: () => {
        this.savingPointage = false;
        this.snackBar.open('Pointage sauvegardé avec succès', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.savingPointage = false;
        this.snackBar.open('Erreur sauvegarde pointage', 'Fermer', { duration: 3000 });
      }
    });
  }

  // ─── Helpers ───

  getInitials(name: string): string {
    return name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      PFE: 'PFE', PFA: 'PFA', STAGE_ETE: 'Stage été', STAGE_OBSERVATION: 'Observation'
    };
    return map[type] ?? type;
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
