import { AfterViewInit, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ComponentRequestHistoryService } from 'src/app/services/component-request-history/component-request-history.service';
import { ComponentRequestService } from 'src/app/services/component-request/component-request.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';

@Component({
  selector: 'app-process-request',
  templateUrl: './process-request.component.html',
  styleUrls: ['./process-request.component.scss']
})
export class ProcessRequestComponent implements AfterViewInit, OnInit {

  onProcessRequest = new EventEmitter();
  componentRequestForm: FormGroup;
  data: any;
  actions: any = []
  availableQuantity: number = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<ProcessRequestComponent>,
    private componentRequestService: ComponentRequestService, private componentRequestHistoryService: ComponentRequestHistoryService, private ngxService: NgxUiLoaderService,
    private formBuilder: FormBuilder, private toastrService: ToastrService, private router: Router, private inventoryService: InventoryService,private commonService:CommonService) {
    this.componentRequestForm = this.formBuilder.group({
      code: [''],
      requestedQuantity: [''],
      requiredDate: [''],
      purpose: [''],
      metierAndProjectName: [''],
      application: [''],
      isReqPartOfYearlyForecast: [''],
      requestDate: [''],
      dgReferenceNumber: [''],
      requestedBy: [''],
      updatedQuantity: [''],
      // ,Validators.max
      approvalAction: ['', Validators.required],
      approvalRemark: [''],
      availableQuantity: ['']
    });
  }

  ngOnInit(): void {
    if (!this.commonService.hasAccess('Component Request')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.data = this.dialogData.componentRequestForm;
    this.actions = this.getActions(this.data?.status);
    console.log("this.data", this.data)
    this.getComponentAvailableQuanity(this.data)
  }
  ngAfterViewInit(): void {
    console.log("this.dialogData", this.dialogData)
    this.componentRequestForm.patchValue(this.data)
  }
  getErrorMessage(): string {
    return "This field is required";
  }

  handleSubmit() {
    this.ngxService.start();

    const formData = this.componentRequestForm.value;
    if (formData?.approvalAction === 'Approve' || formData?.approvalAction === 'Dispatch') {
      this.isRequestQuantityLessThanAvailableQuantity(formData);
    } else {
      this.procesRequest(formData);
    }
  }

  procesRequest(formData: any) {
    let approvalAction = formData.approvalAction;
    console.log('approvalAction', approvalAction);
    let outcome = '';
    if (approvalAction === 'Reject') {
      outcome = 'Rejected'
    } else {
      outcome = this.getRequestStatus(this.data.status);
    }
    console.log('approvalAction', approvalAction);
    this.componentRequestService.updateListItemByAdmin(this.data.id, outcome, formData).then((res) => {
      console.log("res", res)
      if (approvalAction === 'Dispatch') {
        this.getComponentDataFromCatalog(formData, outcome)
      } else {
        this.updateComponentRequestHistoryList(this.data.id, outcome, formData);
      }
      // this.toastrService.success("Request updated successfully!");
      // this.ngxService.stop();
      // this.onProcessRequest.emit();
    })
      .catch((error) => {
        this.dialogRef.close();
        this.toastrService.error("Something went wrong, please try again later");
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }

  getComponentDataFromCatalog(formData: any, outcome: string) {
    this.inventoryService.getItemByComponentCode(formData?.code).then((res) => {
      console.log("items  - getComponentDataFromCatalog", res)
      const currentItem = res.at(0);
      this.updateAvailableQuantity(currentItem?.ID, currentItem?.AvailableQuantity, formData, outcome);
    })
      .catch((error) => {
        console.log("Error retrieving items: - getComponentDataFromCatalog", error);
        this.ngxService.stop();
      });
  }
  getComponentAvailableQuanity(formData: any) {
    this.ngxService.start();
    this.inventoryService.getItemByComponentCode(formData?.code).then((res) => {
      console.log("items  - getComponentDataFromCatalog", res)
      const currentItem = res.at(0);
      // this.updateAvailableQuantity(currentItem?.ID, currentItem?.AvailableQuantity, formData, outcome);
      this.availableQuantity = currentItem?.AvailableQuantity;
      this.componentRequestForm.get("availableQuantity")?.setValue(this.availableQuantity);
      this.ngxService.stop();
    })
      .catch((error) => {
        console.log("Error retrieving items: - getComponentDataFromCatalog", error);
        this.toastrService.error("Something went wrong, please try again later");
        this.ngxService.stop();
      });
  }

  // isRequestQuantityLessThanAvailableQuantity(formData: any) {
  //   let isRequestedQuantityLessThanOrEqualTo = false;
  //   this.inventoryService.getItemByComponentCode(formData?.code).then((res) => {
  //     console.log("items  - getComponentDataFromCatalog", res)
  //     const currentItem = res.at(0);
  //     // this.updateAvailableQuantity(currentItem?.ID, currentItem?.AvailableQuantity, formData, outcome);
  //     isRequestedQuantityLessThanOrEqualTo = currentItem && currentItem?.AvailableQuantity >= formData?.requestedQuantity
  //   })
  //     .catch((error) => {
  //       console.log("Error retrieving items: - getComponentDataFromCatalog", error);
  //       this.ngxService.stop();
  //     });
  //     return isRequestedQuantityLessThanOrEqualTo;
  // }
  isRequestQuantityLessThanAvailableQuantity(formData: any) {

    this.inventoryService.getItemByComponentCode(formData?.code).then((res) => {
      console.log("items  - getComponentDataFromCatalog", res)
      const currentItem = res.at(0);
      console.log("currentItem  - getComponentDataFromCatalog", currentItem)
      let output = false;
      if (formData?.updatedQuantity) {
        output = currentItem && currentItem?.AvailableQuantity >= formData?.updatedQuantity;
      } else {
        output = currentItem && currentItem?.AvailableQuantity >= formData?.requestedQuantity;
      }

      if (output) {
        this.procesRequest(formData);
      } else {
        // this.dialogRef.close();
        this.toastrService.error(`Cannot ${formData?.approvalAction ?? 'process'} request, because requested quantity is greater than available quantity.`);
        this.ngxService.stop();
      }
    })
      .catch((error) => {
        console.error("Error retrieving items: - getComponentDataFromCatalog", error);
        this.dialogRef.close();
        this.toastrService.error("Something went wrong, please try again later");
        this.ngxService.stop();
      });
  }

  updateAvailableQuantity(itemId: number, avilableQuantity: number, formData: any, outcome: string) {
    this.inventoryService.decreaseAvailableQuantityAfterDispatched(itemId, avilableQuantity, formData?.requestedQuantity).then((res) => {
      console.log("items  - updateAvailableQuantity", res)
      this.updateComponentRequestHistoryList(this.data.id, outcome, formData);
    })
      .catch((error) => {
        console.log("Error retrieving items: -updateAvailableQuantity", error);
        this.ngxService.stop();
      });
  }

  updateComponentRequestHistoryList(id: number, outcome: string, formData: any) {
    this.componentRequestHistoryService.addListItem(id, outcome, formData).then((res) => {
      console.log("res", res)
      this.toastrService.success("Request updated successfully!");
      this.ngxService.stop();
      this.onProcessRequest.emit();
    })
      .catch((error) => {
        this.dialogRef.close();
        // this.toastrService.error("Something went wrong, please try again later");
        this.ngxService.stop();
        console.log("Error retrieving items: -updateComponentRequestHistoryList", error);
      });
  }

  getRequestStatus(currentStatus: string) {
    console.log('currentStatus', currentStatus);
    switch (currentStatus) {
      case 'Under Review':
        return 'In Progress'
      case 'In Progress':
        return 'Approved'
      case 'Approved':
        return 'Dispatched'
      case 'Dispatched':
        return 'Received'
      default:
        return ''
    }
  }

  getActions(currentStatus: string) {
    console.log('currentStatus', currentStatus);
    switch (currentStatus) {
      case 'Under Review':
      case 'In Progress':
        return ['Approve', 'Reject']
      case 'Approved':
        return ['Dispatch']
      case 'Dispatched':
        return ['Receive']
      default:
        return []
    }
  }


}
