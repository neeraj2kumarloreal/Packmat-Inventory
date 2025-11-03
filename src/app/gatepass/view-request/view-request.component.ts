import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';

type ColumnConfig = {
  columnDef: string;
  header: string;
  cell: (element: any) => string;
};

const COLUMN_CONFIGS: { [key: string]: ColumnConfig[] } = {
  'Raw Material': [
    { columnDef: 'srNo', header: 'Sr. No', cell: (e) => `${e.srNo}` },
    { columnDef: 'metier', header: 'Metier', cell: (e) => `${e.metier}` },
    { columnDef: 'rmCode', header: 'RM Code', cell: (e) => `${e.rmCode}` },
    { columnDef: 'quantity', header: 'Quantity (Kg)', cell: (e) => `${e.quantity}` },
    { columnDef: 'rate', header: 'Rate', cell: (e) => `${e.rate}` },
    { columnDef: 'noOfPacks', header: 'No. of Packs', cell: (e) => `${e.noOfPacks}` },
    { columnDef: 'amount', header: 'Amount', cell: (e) => `₹${(+e.amount).toFixed(2)}` },
  ],
  'Packaging Material': [
    { columnDef: 'srNo', header: 'Sr. No', cell: (e) => `${e.srNo}` },
    { columnDef: 'description', header: 'Description', cell: (e) => `${e.description}` },
    { columnDef: 'code', header: 'Code', cell: (e) => `${e.code}` },
    { columnDef: 'quantity', header: 'Quantity (Nos)', cell: (e) => `${e.quantity}` },
    { columnDef: 'contactName', header: 'Contact Name', cell: (e) => `${e.name}` },
    { columnDef: 'rate', header: 'Rate', cell: (e) => `${e.rate}` },
    { columnDef: 'noOfPacks', header: 'No. of Packs', cell: (e) => `${e.noOfPacks}` },
    { columnDef: 'amount', header: 'Amount', cell: (e) => `₹${(+e.amount).toFixed(2)}` }
  ],
  'Packmat': [
    { columnDef: 'srNo', header: 'Sr. No', cell: (e) => `${e.srNo}` },
    { columnDef: 'description', header: 'Description', cell: (e) => `${e.description}` },
    { columnDef: 'code', header: 'Code', cell: (e) => `${e.code}` },
    { columnDef: 'receiverName', header: 'Receiver Name', cell: (e) => `${e.name}` },
    { columnDef: 'quantity', header: 'Quantity (Nos)', cell: (e) => `${e.quantity}` },
    { columnDef: 'rate', header: 'Rate', cell: (e) => `${e.rate}` },
    { columnDef: 'noOfPacks', header: 'No. of Packs', cell: (e) => `${e.noOfPacks}` },
    { columnDef: 'amount', header: 'Amount', cell: (e) => `₹${(+e.amount).toFixed(2)}` }
  ],
  'Finished Goods': [
    { columnDef: 'srNo', header: 'Sr. No', cell: (e) => `${e.srNo}` },
    { columnDef: 'description', header: 'Description', cell: (e) => `${e.description}` },
    { columnDef: 'code', header: 'Code', cell: (e) => `${e.code}` },
    { columnDef: 'formulatorName', header: 'Formulator Name', cell: (e) => `${e.formulatorName}` },
    { columnDef: 'quantity', header: 'Quantity (Nos)', cell: (e) => `${e.quantity}` },
    { columnDef: 'rate', header: 'Rate', cell: (e) => `${e.rate}` },
    { columnDef: 'noOfPacks', header: 'No. of Packs', cell: (e) => `${e.noOfPacks}` },
    { columnDef: 'amount', header: 'Amount', cell: (e) => `₹${(+e.amount).toFixed(2)}` },
  ],
  'Bulk': [
    { columnDef: 'srNo', header: 'Sr. No', cell: (e) => `${e.srNo}` },
    { columnDef: 'description', header: 'Description', cell: (e) => `${e.description}` },
    { columnDef: 'code', header: 'Code', cell: (e) => `${e.code}` },
    { columnDef: 'formulatorName', header: 'Formulator Name', cell: (e) => `${e.formulatorName}` },
    { columnDef: 'quantity', header: 'Quantity (Kg)', cell: (e) => `${e.quantity}` },
    { columnDef: 'rate', header: 'Rate', cell: (e) => `${e.rate}` },
    { columnDef: 'noOfBuckets', header: 'No. of Buckets', cell: (e) => `${e.noOfBuckets}` },
    { columnDef: 'amount', header: 'Amount', cell: (e) => `₹${(+e.amount).toFixed(2)}` },
  ]
};

@Component({
  selector: 'app-view-request',
  templateUrl: './view-request.component.html',
  styleUrls: ['./view-request.component.scss']
})
export class ViewRequestComponent {
  // displayedColumns: string[] = ['srNo', 'metier', 'rmCode', 'quantity', 'rate', 'noOfPacks', 'totalAmount'];
  displayedColumns: string[] = [];
  columnConfigs: ColumnConfig[] = [];


  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<ViewRequestComponent>, private gatepassService: GatepassService,
    private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private commonService: CommonService) { };

  requestDetails: any;
  approvalStatus: string = ''

  ngOnInit(): void {
    this.requestDetails = this.dialogData?.requestDetails;
    this.approvalStatus = this.dialogData?.approvalStatus;
    this.setColumns();
    this.fetchMaterialDetails();
  }
  setColumns() {
    const configs = COLUMN_CONFIGS[this.requestDetails?.requestType] || [];
    this.columnConfigs = configs;
    this.displayedColumns = configs.map(c => c.columnDef);
  }

  fetchMaterialDetails() {
    this.ngxService.start();
    this.gatepassService.getMaterialDetailsByGatepassRequestID(this.requestDetails?.id, this.requestDetails?.requestType).then((items) => {
      console.log("updated items", items)
      if (items != undefined || items != null) {
        let allItems = items.map((item) => {
          console.log("item.Author", item);
          return this.commonService.getGatepassMaterialStructureData(item, this.requestDetails?.requestType);
        });
        allItems?.sort((a: any, b: any) => a.srNo - b.srNo);
        console.log("updated items", allItems)
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
        this.toastrService.error("Something went wrong, Please try after sometime!")
        console.log("Error retrieving items: ", error);
      });
  }
}
