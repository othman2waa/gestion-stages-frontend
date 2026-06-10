import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-chatbot-encadrant',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './chatbot-encadrant.component.html',
  styleUrls: ['./chatbot-encadrant.component.scss']
})
export class ChatbotEncadrantComponent {
  besoin = '';
  loading = false;
  reponse: any = null;
  error = '';

  readonly exemples = [
    'Profil data science, Python, Bac+5',
    'Développeur full-stack Angular/Spring',
    'Stagiaire réseaux et sécurité, bon niveau',
  ];

  constructor(private http: HttpClient) {}

  rechercher(): void {
    const msg = this.besoin.trim();
    if (!msg || this.loading) return;
    this.loading = true;
    this.error = '';
    this.reponse = null;
    this.http.post<any>(`${environment.apiUrl}/chatbot/encadrant`, { message: msg }).subscribe({
      next: (r) => { this.reponse = r; this.loading = false; },
      error: () => { this.error = "L'assistant IA est indisponible. Vérifiez qu'Ollama est lancé, puis réessayez."; this.loading = false; }
    });
  }

  utiliserExemple(e: string): void { this.besoin = e; this.rechercher(); }

  scoreColor(s: number): string { return s >= 75 ? '#00843D' : s >= 50 ? '#F47920' : '#DC2626'; }
  scoreLabel(s: number): string { return s >= 75 ? 'Excellent' : s >= 50 ? 'Correct' : 'Faible'; }
  initials(p: string, n: string): string { return `${p?.charAt(0) ?? ''}${n?.charAt(0) ?? ''}`.toUpperCase(); }
}
