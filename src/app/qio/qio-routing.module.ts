import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RaiseQioComponent } from './raise-qio/raise-qio.component';
import { ReportsComponent } from './reports/reports.component';
import { QioHomeComponent } from './qio-home/qio-home.component';

// const routes: Routes = [
//   { path: '', redirectTo: 'raise-qio', pathMatch: 'full' },
//   { path: 'raise-qio', component: RaiseQioComponent },
//   { path: 'reports', component: ReportsComponent }
// ];
const routes: Routes = [
  {
    path: '',
    component: QioHomeComponent,
    children: [
      { path: '', redirectTo: 'raise-qio', pathMatch: 'full' },
      { path: 'raise-qio', component: RaiseQioComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QIORoutingModule { }
