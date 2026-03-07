import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('statutChart') statutChartRef!: ElementRef;
  @ViewChild('typeChart') typeChartRef!: ElementRef;
  @ViewChild('deptChart') deptChartRef!: ElementRef;

  stats: any = null;
  statutChart: any;
  typeChart: any;
  deptChart: any;
  private apiBase = 'http://localhost:8080/api/reporting';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get(`${this.apiBase}/dashboard`)
      .subscribe(data => this.stats = data);
  }

  ngAfterViewInit(): void {
    this.loadCharts();
  }

  loadCharts(): void {
    // Statuts
    this.http.get<any>(`${this.apiBase}/dashboard`).subscribe(data => {
      this.createStatutChart(data);
    });

    // Par type
    this.http.get<any>(`${this.apiBase}/stages-par-type`).subscribe(res => {
      this.createTypeChart(res.data || []);
    });

    // Par département
    this.http.get<any>(`${this.apiBase}/stages-par-departement`).subscribe(res => {
      this.createDeptChart(res.data || []);
    });
  }

  createStatutChart(data: any): void {
    if (!this.statutChartRef) return;
    if (this.statutChart) this.statutChart.destroy();
    this.statutChart = new Chart(this.statutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'En cours', 'Terminés'],
        datasets: [{
          data: [
            data.stagesEnAttente || 0,
            data.stagesEnCours || 0,
            data.stagesTermines || 0
          ],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '65%'
      }
    });
  }

  createTypeChart(data: any[]): void {
    if (!this.typeChartRef) return;
    if (this.typeChart) this.typeChart.destroy();
    const labels = data.map((d: any) => d[0] || d.typeStage || 'Inconnu');
    const values = data.map((d: any) => d[1] || d.count || 0);
    this.typeChart = new Chart(this.typeChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Stages par type',
          data: values,
          backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  createDeptChart(data: any[]): void {
    if (!this.deptChartRef) return;
    if (this.deptChart) this.deptChart.destroy();
    const labels = data.map((d: any) => d[0] || d.departement || 'Inconnu');
    const values = data.map((d: any) => d[1] || d.count || 0);
    this.deptChart = new Chart(this.deptChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Stages par département',
          data: values,
          backgroundColor: '#06b6d4',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          y: { grid: { display: false } }
        }
      }
    });
  }
}