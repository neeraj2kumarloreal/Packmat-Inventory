import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { GatepassRoutingModule } from './gatepass-routing.module';
import { ListGatepassComponent } from './gatepass-components/list-gatepass/list-gatepass.component';
import { CreateGatepassComponent } from './gatepass-components/create-gatepass/create-gatepass.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { GatepassHomeComponent } from './gatepass-home/gatepass-home.component';
import { MyRequestsComponent } from './my-requests/my-requests.component';
import { RequestsForReviewComponent } from './requests-for-review/requests-for-review.component';
import { ApprovalComponent } from './approval/approval.component';
import { ViewRequestComponent } from './view-request/view-request.component';
import { ProcessGatepassRequestComponent } from './process-gatepass-request/process-gatepass-request.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { AllRequestsComponent } from './all-requests/all-requests.component';
import { SharedModule } from '../shared/shared/shared.module';
import { EditGatepassRequestComponent } from './edit-gatepass-request/edit-gatepass-request.component';


@NgModule({
  declarations: [
    ListGatepassComponent,
    CreateGatepassComponent,
    GatepassHomeComponent,
    MyRequestsComponent,
    RequestsForReviewComponent,
    ApprovalComponent,
    ViewRequestComponent,
    ProcessGatepassRequestComponent,
    ConfirmationDialogComponent,
    AllRequestsComponent,
    EditGatepassRequestComponent
  ],
  imports: [
    CommonModule,
    GatepassRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class GatepassModule { }
