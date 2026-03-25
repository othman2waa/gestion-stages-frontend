import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StagiaireLayoutComponent } from '../shared/stagiaire-layout/stagiaire-layout.component';
import { StagiaireDashboardComponent } from '../stagiaire-dashboard/stagiaire-dashboard.component';
import { RapportStageComponent } from '../rapport-stage/rapport-stage.component';
import { StagiaireEvaluationsComponent } from './stagiaire-evaluations/stagiaire-evaluations.component';

const routes: Routes = [
  {
    path: '',
    component: StagiaireLayoutComponent,
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: StagiaireDashboardComponent },
      { path: 'rapport', component: RapportStageComponent },
      { path: 'evaluations', component: StagiaireEvaluationsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StagiairePortalRoutingModule { }