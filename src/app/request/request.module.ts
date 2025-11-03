import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestRoutingModule } from './request-routing.module';
import { ComponentRequestComponent } from './component-request/component-request.component';
import { ListComponentRequestComponent } from './component-request/list-component-request/list-component-request.component';
import { NewComponentRequestComponent } from './component-request/new-component-request/new-component-request.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { ProcessRequestComponent } from './component-request/process-request/process-request.component';
import { ViewComponentRequestComponent } from './component-request/view-component-request/view-component-request.component';


@NgModule({
  declarations: [
    ComponentRequestComponent,
    ListComponentRequestComponent,
    NewComponentRequestComponent,
    ProcessRequestComponent,
    ViewComponentRequestComponent
  ],
  imports: [
    CommonModule,
    RequestRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RequestModule { }
