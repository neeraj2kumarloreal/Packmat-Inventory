import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AddItemComponent } from 'src/app/inventory/catalog/add-item/add-item/add-item.component';
import { ViewEditItemComponent } from 'src/app/inventory/catalog/view-edit-item/view-edit-item.component';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';

@Component({
  selector: 'app-list-gatepass',
  templateUrl: './list-gatepass.component.html',
  styleUrls: ['./list-gatepass.component.scss']
})
export class ListGatepassComponent {
  dataSource = new MatTableDataSource<any>([]);;
  displayedColumns: any = ["requestType", "invoiceNo", "customerName", "createdBy", "status", "actions"];
  baseUrl: string = "https://loreal.sharepoint.com"
  currentUserRole: string = ''
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(private dialog: MatDialog, private router: Router,private gatepassService: GatepassService, private ngxService: NgxUiLoaderService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.currentUserRole = localStorage.getItem("role") || ''
    this.fetchGatepassRequestList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.ProductName.toLowerCase().includes(filter) || data.Code.toLowerCase().includes(filter);
    };
  }

  ngAfterViewInit(): void {
  }
  
  fetchGatepassRequestList() {
    this.ngxService.start();
    this.gatepassService.getAllItems().then((items) => {

      if (items != undefined || items != null) {
        const allItems = items.map((item) => ({
          ID: item.ID,
          CustomerName: item?.Title,
          BaseAddress: item?.BaseAddress,
          RequestType: item?.RequestType,
          CustomerAddress: item?.CustomerAddress,
          CustomerEmail: item?.CustomerEmail,
          PONo: item?.PONo,
          PODate: item?.PODate,
          InvoiceNo: item?.InvoiceNo,
          InvoiceDate: item?.InvoiceDate,
          NoOfPackages: item?.NoOfPackages,
          VatTin: item?.VatTin,
          CstTin: item?.CstTin,
          EccNo: item?.EccNo,
          ["GSTIN/UniqueID"]: item?.["GSTIN/UniqueID"], 
          TransporterName: item?.TransporterName,
          VehicalNo: item?.VehicalNo,
          LRNo: item?.LRNo,
          SealNo: item?.SealNo,
          Note: item?.Note,
          ValueOfProduct: item?.ValueOfProduct,
          Taxes: item?.Taxes,
          SubTotal: item?.SubTotal,
          OtherCharges: item?.OtherCharges,
          NetAmount: item?.NetAmount,
          RequestStatus: item?.RequestStatus,
          CreatedBy: item?.Author,
          secondaryApprovalRemark: item?.SecondaryApprovalRemark,
          finalApprovalRemark: item?.FinalApprovalRemark
        }))
        console.log("allItems", allItems);
        this.dataSource = new MatTableDataSource(allItems);
        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        this.ngxService.stop();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong , please try after some time",)
        console.log("Error retrieving items: ", error);
      });
  }


  handleAddAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Add',
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      // dialogConfig.height= '100%',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(AddItemComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onComponentAdd.subscribe(
      (response) => {
        dialogRef.close();
        this.fetchGatepassRequestList();
        // this.fetchComponentRequestList();
      }
    );

  }

  handleViewAction(row: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'View',
      formData: row
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      // dialogConfig.height= '100%',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ViewEditItemComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onComponentEditOrView.subscribe(
      (response) => {
        dialogRef.close();
        // this.fetchGatepassRequestList();
        // this.fetchComponentRequestList();
      }
    );

  }
  applyFilter(event: Event) {
    // now applies filtering only to 'name' and 'code' columns since we defined filterPredicate.
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
