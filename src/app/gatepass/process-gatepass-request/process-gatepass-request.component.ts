import { Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';
import { ViewRequestComponent } from '../view-request/view-request.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PdfService } from 'src/app/services/pdf-service/pdf.service';
import { CommonService } from 'src/app/services/common/common.service';

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
  selector: 'app-process-gatepass-request',
  templateUrl: './process-gatepass-request.component.html',
  styleUrls: ['./process-gatepass-request.component.scss'],
})
export class ProcessGatepassRequestComponent {
  // displayedColumns: string[] = ['srNo', 'metier', 'rmCode', 'quantity', 'rate', 'noOfPacks', 'totalAmount'];
  displayedColumns: string[] = [];
  columnConfigs: ColumnConfig[] = [];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  onRequestSubmit = new EventEmitter();
  otherDetailsForm: FormGroup;
  transporterList: string[] = ["Purohit Courier", "Patel Airfreight"]

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<ProcessGatepassRequestComponent>, private gatepassService: GatepassService,
    private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private formBuilder: FormBuilder, private pdfService: PdfService, private commonService: CommonService) {
    this.otherDetailsForm = this.formBuilder.group({
      transporterName: ['', [Validators.required]],
      vehicalNo: ['', []],
      lrNo: ['', []],
      sealNo: ['', []],
      poNo: ['', []],
      poDate: ['', []],
      valueofProduct: ['', []],
      taxes: ['', []],
      otherCharges: ['', []],
      action: ['', Validators.required],
      remark: ['', Validators.required]
    });
  };

  requestDetails: any;

  ngOnInit(): void {
    this.requestDetails = this.dialogData?.requestDetails;
    if (this.requestDetails?.customerAddress === "Banglore:-, RNI Loreal India Pvt Ltd, No. A-1 First floor Tower A Einstein buildingBearys, Global Research Triangle Sy No. 63/3B, Gorvigere village Bidarahalli Hobli White field Ashram Road Banglore 560 067 India" ||
      this.requestDetails?.customerAddress === "Baddi:-, L'ORÉAL India Pvt. Ltd,  Plot no 147 EPIP phase-1Jharmajri Baddi, Pin-173205 Solan HIMACHAL PRADESH") {
      this.otherDetailsForm.get("transporterName")?.setValue("Patel Airfreight");
    } else if (this.requestDetails?.customerAddress === "Mumbai:-, RNI Loreal India Pvt Ltd,7th floor Universal Majestic, Ghatkopar Mankhurd Link Road Chembur Mumbai -71") {
      this.otherDetailsForm.get("transporterName")?.setValue("Purohit Courier");
    }
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
  // fetchRawMaterialDetails() {
  //   this.ngxService.start();
  //   this.gatepassService.getMaterialDetailsByGatepassRequestID(this.requestDetails?.id,this.requestDetails?.requestType).then((items) => {
  //     console.log("updated items", items)
  //     if (items != undefined || items != null) {
  //       const allItems = items.map((item) => {
  //         console.log("item.Author", item);
  //         return {
  //           id: item?.ID,
  //           srNo: item?.Title,
  //           metier: item?.Metier,
  //           rmCode: item?.RMCode,
  //           quantity: item?.QuantityInKg,
  //           rate: item?.Rate,
  //           noOfPacks: item?.NoOfPacks,
  //           totalAmount: item?.AmountInINR,
  //           createdDate: item?.Created,
  //           createdBy: String(Object.values(item?.Author).at(1)),
  //           // requestedBy: item.Author.$DI_1,
  //         };
  //       });
  //       console.log("updated items", allItems)
  //       this.dataSource = new MatTableDataSource(allItems);
  //       if (this.paginator && this.sort) {
  //         this.dataSource.paginator = this.paginator;
  //         this.dataSource.sort = this.sort;
  //       }
  //       this.ngxService.stop();
  //     }

  //   })
  //     .catch((error) => {
  //       this.ngxService.stop();
  //       this.toastrService.error("Something went wrong, Please try after sometime!")
  //       console.log("Error retrieving items: ", error);
  //     });
  // }

  handleSubmit() {
    console.log("this.otherDetailsForm", this.otherDetailsForm.value);
    this.ngxService.start();
    let status = '';
    if (this.otherDetailsForm?.value?.action === 'sentBack') {
      status = 'Sent Back for Changes'
    } else if (this.otherDetailsForm?.value?.action === 'approve') {
      status = 'Under Review'
    }
    this.gatepassService.updateGatepassRequest(this.requestDetails, { ...this.otherDetailsForm.value, "status": status }).then((res) => {
      if (status === "Under Review") {
        this.pdfService.generatePDF(this.requestDetails?.id, this.dataSource?.data, this?.requestDetails?.requestType);
      }
      this.ngxService.stop();
      this.toastrService.success("Request Updated Successfully");
      this.onRequestSubmit.emit();
    })
      .catch((error) => {
        this.dialogRef.close();
        this.ngxService.stop();
        this.toastrService.error("Something went wrong, Please try after sometime!")
        console.log("Error retrieving items: ", error);
      });

  }
  getErrorMessage(): string {
    return "This field is required";
  }
}
