import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../shared/layout/layout.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { StagiaireListComponent } from '../stagiaires/stagiaire-list/stagiaire-list.component';
import { StageListComponent } from '../stages/stage-list/stage-list.component';
import { EncadrantListComponent } from '../encadrants/encadrant-list/encadrant-list.component';
import { ConventionListComponent } from '../conventions/convention-list/convention-list.component';
import { EvaluationListComponent } from '../evaluations/evaluation-list/evaluation-list.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'stagiaires', component: StagiaireListComponent },
      { path: 'stages', component: StageListComponent },
      { path: 'encadrants', component: EncadrantListComponent },
      { path: 'conventions', component: ConventionListComponent },
      { path: 'evaluations', component: EvaluationListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}