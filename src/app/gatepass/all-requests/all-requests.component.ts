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
import { CommonService } from 'src/app/services/common/common.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-all-requests',
  templateUrl: './all-requests.component.html',
  styleUrls: ['./all-requests.component.scss'],
  providers: [DatePipe]
})
export class AllRequestsComponent {
  displayedColumns: string[] = ['id', 'requestType', 'createdBy', 'createdDate', 'totalAmount', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  allRequests = new MatTableDataSource<any>([]);
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
    private commonService: CommonService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.fetchPendingRequestList()
  }

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
    this.gatepassService.getAllGatepassRequest().then((items) => {
      console.log("updated items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          console.log("item.Author", item);
          return {
            id: item.ID,
            customerName: item?.Title,
            baseAddress: item?.BaseAddress,
            requestType: item?.RequestType,
            customerAddress: item?.CustomerAddress,
            customerEmail: item?.CustomerEmail,
            poNo: item?.PONo,
            poDate: item?.PODate,
            invoiceNumber: item?.InvoiceNo,
            invoiceDate: item?.InvoiceDate,
            noOfPackages: item?.NoOfPackages,
            weight: item?.Weight,
            vatTin: item?.VatTin,
            cstTin: item?.CstTin,
            eccNo: item?.EccNo,
            gstin: item?.GSTIN_x002f_UniqueID,
            transporterName: item?.TransporterName,
            vehicalNo: item?.VehicalNo,
            lrNo: item?.LRNo,
            sealNo: item?.SealNo,
            note: item?.Note,
            valueOfProduct: item?.ValueOfProduct,
            taxes: item?.Taxes,
            subTotal: item?.SubTotal,
            otherCharges: item?.OtherCharges,
            netAmount: item?.NetAmount,
            requestStatus: item?.RequestStatus,
            createdBy: String(Object.values(item?.Author).at(1)),
            createdDate: item?.Created,
            secondaryApprovalRemark: item?.SecondaryApprovalRemark,
            finalApprovalRemark: item?.FinalApprovalRemark
          };
        });
        console.log("updated items", allItems)
        this.allRequests.data = allItems;
        this.allRequests.paginator = this.paginator;
        this.allRequests.sort = this.sort;
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
      requestDetails: row,
      approvalStatus: row?.requestStatus
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ViewRequestComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
  }

  handleDownloadInvoicePDF(request: any) {
    let path = 'PDFFiles/';
    const invoiceDate = this.formatDate(request?.invoiceDate);
    this.commonService.downloadGatepassPDF(path + request?.invoiceNumber + "_" + invoiceDate)
  }

  handleDownloadGatepassPDF(request: any) {
    let path = 'GatePassPDFFiles/';
    const invoiceDate = this.formatDate(request?.invoiceDate);
    this.commonService.downloadGatepassPDF(path + request?.invoiceNumber + "_" + invoiceDate + "_gatepass")
  }

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd-MM-yyyy") || "";
  }
}
