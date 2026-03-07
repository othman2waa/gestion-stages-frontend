import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StageListComponent } from './stage-list/stage-list.component';
import { StageFormComponent } from './stage-form/stage-form.component';
import { StageDetailComponent } from './stage-detail/stage-detail.component';

const routes: Routes = [
  { path: '', component: StageListComponent },
  { path: 'new', component: StageFormComponent },
  { path: ':id/edit', component: StageFormComponent },
  { path: ':id/workflow', component: StageDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StagesRoutingModule { }