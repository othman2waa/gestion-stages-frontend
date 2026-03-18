import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from '../shared/layout/layout.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { StagiaireListComponent } from '../stagiaires/stagiaire-list/stagiaire-list.component';
import { StageListComponent } from '../stages/stage-list/stage-list.component';
import { StageDetailComponent } from '../stages/stage-detail/stage-detail.component';
import { EncadrantListComponent } from '../encadrants/encadrant-list/encadrant-list.component';
import { ConventionListComponent } from '../conventions/convention-list/convention-list.component';
import { EvaluationListComponent } from '../evaluations/evaluation-list/evaluation-list.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { StagiaireDashboardComponent } from '../stagiaire-dashboard/stagiaire-dashboard.component';
import { SuiviHebdomadaireComponent } from '../suivi-hebdomadaire/suivi-hebdomadaire.component';
import { EncadrantDashboardComponent } from '../encadrant-dashboard/encadrant-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'stagiaires', component: StagiaireListComponent },
      { path: 'stages', component: StageListComponent },
      { path: 'stages/:id/workflow', component: StageDetailComponent },
      { path: 'encadrants', component: EncadrantListComponent },
      { path: 'conventions', component: ConventionListComponent },
      { path: 'evaluations', component: EvaluationListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'onboarding', component: OnboardingComponent },
      { path: 'stagiaire-dashboard', component: StagiaireDashboardComponent },
      { path: 'suivi-hebdomadaire', component: SuiviHebdomadaireComponent },
      { path: 'encadrant-dashboard', component: EncadrantDashboardComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}