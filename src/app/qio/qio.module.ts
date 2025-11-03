import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QIORoutingModule } from './qio-routing.module';
import { QioHomeComponent } from './qio-home/qio-home.component';
import { RaiseQioComponent } from './raise-qio/raise-qio.component';
import { ReportsComponent } from './reports/reports.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { SharedModule } from '../shared/shared/shared.module';


@NgModule({
  declarations: [
    QioHomeComponent,
    RaiseQioComponent,
    ReportsComponent
  ],
  imports: [
    CommonModule,
    QIORoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
    // RouterModule
  ]
})
export class QIOModule { }
