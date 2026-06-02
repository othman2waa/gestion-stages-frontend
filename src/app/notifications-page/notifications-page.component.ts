import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NotificationService, AppNotification } from '../core/services/notification.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatChipsModule, MatPaginatorModule],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {
  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];
  isLoading = true;

  selectedType = '';
  selectedLu = '';
  readonly types = ['STAGE', 'CANDIDATURE', 'CONVENTION', 'EVALUATION', 'ATTESTATION', 'SYSTEME'];

  // Pagination
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50];

  get paginatedNotifications(): AppNotification[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredNotifications.slice(start, start + this.pageSize);
  }

  get unreadCount(): number { return this.notifications.filter(n => !n.lue).length; }
  get totalCount(): number { return this.notifications.length; }

  constructor(
    private notifService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.notifService.getAll().subscribe({
      next: (data) => { this.notifications = data; this.applyFilters(); this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    let result = this.notifications;
    if (this.selectedType) result = result.filter(n => n.type === this.selectedType);
    if (this.selectedLu === 'non_lues') result = result.filter(n => !n.lue);
    if (this.selectedLu === 'lues') result = result.filter(n => n.lue);
    this.filteredNotifications = result;
    this.pageIndex = 0;
  }

  onFilterType(type: string): void {
    this.selectedType = this.selectedType === type ? '' : type;
    this.applyFilters();
  }

  onFilterLu(val: string): void {
    this.selectedLu = this.selectedLu === val ? '' : val;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  markAsRead(notif: AppNotification): void {
    if (!notif.lue) {
      this.notifService.marquerLue(notif.id).subscribe();
      notif.lue = true;
    }
    if (notif.lien) this.router.navigate([notif.lien]);
  }

  markAllRead(): void {
    this.notifService.marquerToutesLues().subscribe(() => {
      this.notifications.forEach(n => n.lue = true);
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      STAGE: 'work', CANDIDATURE: 'inbox', CONVENTION: 'description',
      EVALUATION: 'star_rate', ATTESTATION: 'workspace_premium', SYSTEME: 'info'
    };
    return icons[type] ?? 'notifications';
  }

  getColor(type: string): string {
    const colors: Record<string, string> = {
      STAGE: '#00843D', CANDIDATURE: '#1E40AF', CONVENTION: '#7C3AED',
      EVALUATION: '#F47920', ATTESTATION: '#0891B2', SYSTEME: '#64748B'
    };
    return colors[type] ?? '#64748B';
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return Math.floor(diff / 86400) + ' j';
    return date.toLocaleDateString('fr-FR');
  }
}
