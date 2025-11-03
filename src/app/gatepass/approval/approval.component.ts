import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';
import { BaseRequest } from 'src/app/types/request.types';
import { ViewRequestComponent } from '../view-request/view-request.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PdfService } from 'src/app/services/pdf-service/pdf.service';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent {

  displayedColumns: string[] = ['id', 'requestType', 'createdBy', 'createdDate', 'totalAmount', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);

  approvalRequests: BaseRequest[] = [];
  selectedRequest: BaseRequest | null = null;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  constructor(private ngxService: NgxUiLoaderService,
    private gatepassService: GatepassService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private router: Router, private commonService: CommonService, private pdfService: PdfService) { }

  ngOnInit() {
    this.fetchUnderReviewRequestList();
  }

  fetchUnderReviewRequestList() {
    this.ngxService.start();
    this.gatepassService.getAllUnderReviewGatepassRequest().then((items) => {
      console.log("updated items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          console.log("item.Author", item);
          return this.commonService.getGatepassRequestStructureData(item);
        });
        console.log("updated items", allItems)
        this.dataSource.data = allItems;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
      approvalStatus: 'Under Review'
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

  async approveRequest(request: any) {
    const isProcessed = await this.isRequestAlreadyProcessed(request?.id);
    if (isProcessed) {
      this.toastrService.info('This request has already been approved or rejected.');
      this.fetchUnderReviewRequestList();
    } else {
      console.log("requestId", request?.id);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        action: 'approve'
      };
      dialogConfig.maxWidth = '90vw',
        dialogConfig.maxHeight = '100vh',
        dialogConfig.width = '30%'
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
      this.router.events.subscribe(() => {
        dialogRef.close();
      });
      const sub = dialogRef.componentInstance.onYes.subscribe(
        (response) => {
          this.processRequest(request, 'Approved', "")
          dialogRef.close();
        }
      );
    }
  }

  async rejectRequest(request: any) {
    const isProcessed = await this.isRequestAlreadyProcessed(request?.id);
    if (isProcessed) {
      this.toastrService.info('This request has already been approved or rejected.');
      this.fetchUnderReviewRequestList();
    } else {
      console.log("requestId", request);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        action: 'reject'
      };
      dialogConfig.maxWidth = '90vw',
        dialogConfig.maxHeight = '100vh',
        dialogConfig.width = '60%'
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
      this.router.events.subscribe(() => {
        dialogRef.close();
      });
      const sub = dialogRef.componentInstance.onYes.subscribe(
        (remark) => {
          console.log("remark", remark);
          this.processRequest(request, 'Rejected', remark)
          dialogRef.close();
        }
      );
    }
  }

  processRequest(request: any, status: string, remark: string) {
    this.ngxService.start();
    this.gatepassService.processGatepassRequest(request?.id, status, remark).then((items) => {
      console.log("updated items", items)
      this.toastrService.success(`Request ${status} successfully`);
      this.fetchUnderReviewRequestList();
      if (status === 'Approved') {
        this.pdfService.generateGatepassPDF(request);
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong, Please try after sometime!");
        console.log("Error retrieving items: ", error);
      });
  }

  async isRequestAlreadyProcessed(id: number): Promise<boolean> {
    try {
      const item = await this.gatepassService.getGatepassRequestById(id);
      const res = this.commonService.getGatepassRequestStructureData(item);
      return res?.requestStatus === 'Approved' || res?.requestStatus === 'Rejected';
    } catch (error) {
      console.error('Error:', error);
      return false; // or throw error if you want to handle it upstream
    }
  }


  // getTableColumns(requestType: string): string[] {
  //   return this.requestService.getTableColumns(requestType as any);
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
}
