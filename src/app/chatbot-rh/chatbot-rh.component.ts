import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-chatbot-rh',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './chatbot-rh.component.html',
  styleUrls: ['./chatbot-rh.component.scss']
})
export class ChatbotRhComponent {
  question = '';
  loading = false;
  reponse: any = null;
  error = '';
  messages: { role: 'user' | 'bot'; text: string }[] = [];

  readonly exemples = [
    'Résume la situation actuelle',
    'Combien de candidatures en attente ?',
    'Combien de stages en cours et terminés ?',
  ];

  constructor(private http: HttpClient) {}

  envoyer(): void {
    const q = this.question.trim();
    if (!q || this.loading) return;
    this.messages.push({ role: 'user', text: q });
    this.question = '';
    this.loading = true;
    this.error = '';
    this.http.post<any>(`${environment.apiUrl}/chatbot/rh`, { message: q }).subscribe({
      next: (r) => {
        this.reponse = r;
        this.messages.push({ role: 'bot', text: r?.message || '—' });
        this.loading = false;
      },
      error: () => { this.error = "L'assistant IA est indisponible. Vérifiez qu'Ollama est lancé."; this.loading = false; }
    });
  }

  utiliser(e: string): void { this.question = e; this.envoyer(); }

  /** Démarre un nouveau fil : efface l'historique côté serveur (mémoire) et côté interface. */
  nouvelleConversation(): void {
    this.http.post(`${environment.apiUrl}/chatbot/rh/reset`, {}).subscribe({ next: () => {}, error: () => {} });
    this.messages = [];
    this.reponse = null;
    this.error = '';
    this.question = '';
  }

  get kpis(): { label: string; value: any }[] {
    const s = this.reponse?.stats; if (!s) return [];
    return [
      { label: 'Candidatures', value: s.candidatures_total },
      { label: 'En attente', value: s.candidatures_en_attente },
      { label: 'Stages en cours', value: s.stages_en_cours },
      { label: 'Terminés', value: s.stages_termines },
    ];
  }
}
