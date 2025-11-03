import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ExcelService } from 'src/app/services/excel-service/excel.service';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';
import { BaseRequest } from 'src/app/types/request.types';
import { ViewRequestComponent } from '../view-request/view-request.component';
import { ProcessGatepassRequestComponent } from '../process-gatepass-request/process-gatepass-request.component';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-requests-for-review',
  templateUrl: './requests-for-review.component.html',
  styleUrls: ['./requests-for-review.component.scss']
})
export class RequestsForReviewComponent {
  displayedColumns: string[] = ['id', 'requestType', 'createdBy', 'createdDate', 'totalAmount', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pendingRequests = new MatTableDataSource<any>([]);
  selectedRequest: BaseRequest | null = null;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private excelService: ExcelService,
    private ngxService: NgxUiLoaderService,
    private gatepassService: GatepassService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private commonService: CommonService) { }

  ngOnInit() {
    this.fetchPendingRequestList()
  }

  // ngAfterViewInit() {
  //   this.pendingRequests.paginator = this.paginator!;
  //   this.pendingRequests.sort = this.sort!;
  // }

  // viewRequest(request: BaseRequest) {
  //   this.selectedRequest = request;
  // }

  closeRequestDetails() {
    this.selectedRequest = null;
  }



  showAlert(message: string, type: 'success' | 'error' | 'info') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  fetchPendingRequestList() {
    this.ngxService.start();
    this.gatepassService.getAllPendingGatepassRequest().then((items) => {
      console.log("updated items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          console.log("item.Author", item);
          return this.commonService.getGatepassRequestStructureData(item);
          // return {
          //   id: item.ID,
          //   customerName: item?.Title,
          //   baseAddress: item?.BaseAddress,
          //   requestType: item?.RequestType,
          //   customerAddress: item?.CustomerAddress,
          //   customerEmail: item?.CustomerEmail,
          //   poNo: item?.PONo,
          //   poDate: item?.PODate,
          //   invoiceNumber: item?.InvoiceNo,
          //   invoiceDate: item?.InvoiceDate,
          //   noOfPackages: item?.NoOfPackages,
          //   weight: item?.Weight,
          //   vatTin: item?.VatTin,
          //   cstTin: item?.CstTin,
          //   eccNo: item?.EccNo,
          //   gstin: item?.GSTIN_x002f_UniqueID,
          //   transporterName: item?.TransporterName,
          //   vehicalNo: item?.VehicalNo,
          //   lrNo: item?.LRNo,
          //   sealNo: item?.SealNo,
          //   note: item?.Note,
          //   valueOfProduct: item?.ValueOfProduct,
          //   taxes: item?.Taxes,
          //   subTotal: item?.SubTotal,
          //   otherCharges: item?.OtherCharges,
          //   netAmount: item?.NetAmount,
          //   requestStatus: item?.RequestStatus,
          //   createdBy: String(Object.values(item?.Author).at(1)),
          //   createdDate: item?.Created,
          // };
        });
        console.log("updated items", allItems)
        this.pendingRequests.data = allItems;
        this.pendingRequests.paginator = this.paginator;
        this.pendingRequests.sort = this.sort;
        this.ngxService.stop();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong, Please try after sometime!")
        console.log("Error retrieving items: ", error);
      });
  }

  handleViewRequest(row: any) {
    console.log("row", row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      requestDetails: row
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ViewRequestComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    // const sub = dialogRef.componentInstance.onProcessRequest.subscribe(
    //   (response) => {
    //     dialogRef.close();
    //     this.fetchComponentRequestList();
    //   }
    // );

  }

  sendForReview(row: any) {
    // this.requestService.updateRequestStatus(requestId, 'Under Review');
    // this.showAlert('Request sent for approval', 'success');
    // // this.loadPendingRequests();

    // if (this.selectedRequest && this.selectedRequest.id === requestId) {
    //   this.selectedRequest = null;
    // }

    console.log("row", row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      requestDetails: row
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ProcessGatepassRequestComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onRequestSubmit.subscribe(
      (response) => {
        dialogRef.close();
        this.fetchPendingRequestList();
      }
    );
  }
}
