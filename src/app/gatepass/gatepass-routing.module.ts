import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GatepassHomeComponent } from './gatepass-home/gatepass-home.component';

const routes: Routes = [
  { path: '', component: GatepassHomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GatepassRoutingModule { }
