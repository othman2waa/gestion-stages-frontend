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
import { RapportStageComponent } from '../rapport-stage/rapport-stage.component';
import { CandidaturesAdminComponent } from '../candidatures-admin/candidatures-admin.component';
import { GestionComptesComponent } from '../gestion-comptes/gestion-comptes.component';
import { AnnoncesAdminComponent } from '../annonces-admin/annonces-admin.component';
import { DepartementsComponent } from '../departements/departements.component';
import { AttestationsAdminComponent } from '../attestations-admin/attestations-admin.component';
import { SujetsAdminComponent } from '../sujets-admin/sujets-admin.component';
import { CandidaturesEncadrantComponent } from '../candidatures-encadrant/candidatures-encadrant.component';
import { ArchivesComponent } from '../archives/archives.component';
import { ReportingComponent } from '../reporting/reporting.component';
import { NotificationsPageComponent } from '../notifications-page/notifications-page.component';
import { FichesAppreciationAdminComponent } from '../fiches-appreciation-admin/fiches-appreciation-admin.component';

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
      { path: 'gestion-comptes', component: GestionComptesComponent },
      { path: 'rapport-stage', component: RapportStageComponent },
      { path: 'candidatures', component: CandidaturesAdminComponent },
      { path: 'annonces', component: AnnoncesAdminComponent },
      { path: 'departements', component: DepartementsComponent },
      { path: 'attestations', component: AttestationsAdminComponent },
      { path: 'sujets', component: SujetsAdminComponent },
      { path: 'candidatures-encadrant', component: CandidaturesEncadrantComponent },
      { path: 'archives', component: ArchivesComponent },
      { path: 'reporting', component: ReportingComponent },
      { path: 'notifications', component: NotificationsPageComponent },
      { path: 'fiches-appreciation', component: FichesAppreciationAdminComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}