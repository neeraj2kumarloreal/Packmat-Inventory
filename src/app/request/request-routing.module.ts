import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentRequestComponent } from './component-request/component-request.component';
import { ListComponentRequestComponent } from './component-request/list-component-request/list-component-request.component';
import { NewComponentRequestComponent } from './component-request/new-component-request/new-component-request.component';
import { ViewComponentRequestComponent } from './component-request/view-component-request/view-component-request.component';

const routes: Routes = [

  {
    // path: 'component-request', component: ComponentRequestComponent,
    path: '', component: ComponentRequestComponent,
    children: [
      { path: '', component: ListComponentRequestComponent },
      { path: 'new', component: NewComponentRequestComponent },
      { path: 'view', component: ViewComponentRequestComponent },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestRoutingModule { }
