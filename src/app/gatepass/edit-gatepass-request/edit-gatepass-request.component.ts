import { Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ExcelService } from 'src/app/services/excel-service/excel.service';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
import { RequestService } from 'src/app/services/request.service';
import { RequestType, BaseRequest, RequestItem } from 'src/app/types/request.types';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ViewRequestComponent } from '../view-request/view-request.component';

@Component({
  selector: 'app-edit-gatepass-request',
  templateUrl: './edit-gatepass-request.component.html',
  styleUrls: ['./edit-gatepass-request.component.scss']
})
export class EditGatepassRequestComponent {
  displayedColumns: string[] = ['id', 'requestType', 'status', 'createdDate', 'totalAmount', 'actions'];
  // Example métiers list
  metiers: string[] = [];
  // In your component.ts
  rmCodes: string[] = [];
  rmCodePriceMap = new Map<string, number>();
  packmatCodes: any[] = [];
  onUpdate = new EventEmitter();


  // For tracking which dropdown is open (by row index)
  openDropdownIndex: number | null = null;
  openDropdownIndexForPackmatCode: number | null = null;


  selectedRequestType: RequestType | '' = '';
  currentRequest: any = {
    items: [],
    totalAmount: 0
  };
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  // In your component.ts
  addresses: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  requestDetails: any;

  constructor(
    private excelService: ExcelService,
    private ngxService: NgxUiLoaderService,
    private gatepassService: GatepassService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private commonService: CommonService,
    private requestService: RequestService,
    private inventoryService: InventoryService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<EditGatepassRequestComponent>,
  ) { }

  async ngOnInit() {
    this.requestDetails = this.dialogData?.requestDetails;
    this.selectedRequestType = this.requestDetails?.requestType;
    this.currentRequest = {
      ...this.currentRequest,
      ...this.requestDetails
    };
    console.log("this.currentRequest", this.currentRequest);
    this.fetchAddressList();
    this.fetchMetierList();
    const { codes, priceMap } = await this.excelService.fetchRawMaterialExcelFile();
    this.rmCodes = codes;
    this.rmCodePriceMap = priceMap;
    this.fetchPackmatCodeandName();
    this.fetchMaterialDetails();
  }



  private _filterRmCodes(value: string): string[] {
    const filterValue = (value || '').toLowerCase();
    return this.rmCodes.filter(code => code.toLowerCase().includes(filterValue));
  }



  onRequestTypeChange() {
    if (this.selectedRequestType) {
      this.resetCurrentRequest();
      this.addItem(); // Add initial row
    }
  }
  getTableColumns(): string[] {
    if (!this.selectedRequestType) return [];
    return this.requestService.getTableColumns(this.selectedRequestType as RequestType);
  }
  addItem() {
    if (!this.selectedRequestType) return;

    const newItem = this.createEmptyItem(
      this.selectedRequestType as RequestType,
      this.currentRequest.items!.length + 1
    );
    this.currentRequest.items!.push(newItem);
  }

  createEmptyItem(requestType: RequestType, srNo: number): RequestItem {
    const baseItem = {
      srNo,
      quantity: 0,
      rate: 0,
      amount: 0
    };

    switch (requestType) {
      case 'Raw Material':
        return {
          ...baseItem,
          metier: '',
          rmCode: '',
          quantityUnit: 'kg' as const,
          rateUnit: 'INR/kg' as const,
          noOfPacks: 0
        };
      case 'Packaging Material':
      case 'Packmat':
        return {
          ...baseItem,
          description: '',
          code: '',
          name: '',
          quantityUnit: 'nos' as const,
          rateUnit: 'INR' as const,
          noOfPacks: 0
        };
      case 'Finished Goods':
        return {
          ...baseItem,
          description: '',
          code: '',
          name: '',
          // formulator: '',
          quantityUnit: 'nos' as const,
          rateUnit: 'INR' as const,
          noOfPacks: 0
        };
      case 'Bulk':
        return {
          ...baseItem,
          description: '',
          code: '',
          name: '',
          // formulator: '',
          quantityUnit: 'kg' as const,
          rateUnit: 'INR' as const,
          noOfBuckets: 0
        };
      default:
        return {
          ...baseItem,
          quantityUnit: 'nos' as const,
          rateUnit: 'INR' as const
        };
    }
  }

  resetCurrentRequest() {
    this.currentRequest = {
      requestType: this.selectedRequestType as RequestType,
      status: 'Draft',
      createdBy: 'John Doe',
      items: [],
      totalAmount: 0,
      customerName: '',
      customerEmail: '',
      address: '',
      noOfPackages: '',
      weight: ''
    };
  }

  getColumnWidth(column: string): string {
    const widthMap: { [key: string]: string } = {
      'Sr. No': '80px',
      'Amount (INR)': '120px',
      'Quantity (kg)': '120px',
      'Quantity (Nos)': '120px',
      'Rate (INR/kg)': '130px',
      'Rate per Unit (INR)': '140px',
      'No. of Packs': '110px',
      'No. of Buckets': '120px'
    };
    return widthMap[column] || '150px';
  }

  removeItem(index: number) {
    this.currentRequest.items!.splice(index, 1);
    // Renumber items
    this.currentRequest.items!.forEach((item: any, i: any) => {
      item.srNo = i + 1;
    });
    this.calculateTotalAmount();
  }

  // calculateAmount(index: number) {
  //   const item = this.currentRequest.items![index];
  //   console.log("calculateAmount called",item);
  //   if (item) {
  //     item.amount = item.quantity * item.rate;
  //     this.calculateTotalAmount();
  //   }
  // }
  calculateAmount(index: number) {
    const item = this.currentRequest.items![index];
    if (item) {
      item.quantity = Number(item.quantity) || 0;
      item.rate = Number(item.rate) || 0;
      item.amount = item.quantity * item.rate;
      if (isNaN(item.amount)) item.amount = 0;
      this.calculateTotalAmount();
    }
  }

  calculateTotalAmount() {
    this.currentRequest.totalAmount = this.currentRequest.items!.reduce((sum: any, item: any) => sum + item.amount, 0);
  }

  getTotalAmount(): number {
    return this.currentRequest.totalAmount || 0;
  }

  isFormValid(): boolean {
    // Check all required fields for all request types
    if (
      !this.selectedRequestType ||
      !this.currentRequest.customerAddress ||
      !this.currentRequest.customerName ||
      !this.currentRequest.noOfPackages ||
      !this.currentRequest.weight
    ) {
      return false;
    }

    // Check at least one item is present
    return Array.isArray(this.currentRequest.items) && this.currentRequest.items.length > 0;
  }

  // isFormValid(): boolean {
  //   if (!this.selectedRequestType || !this.currentRequest.customerAddress) return false;
  //   if (this.selectedRequestType === 'Raw Material' && !this.currentRequest.customerName && !this.currentRequest.noOfPackages && this.currentRequest.weight) return false;
  //   return this.currentRequest.items!.length > 0;
  // }

  updateRequest() {
    if (this.isFormValid()) {
      this.ngxService.start();
      this.gatepassService.editGatepassRequest(
        this.currentRequest
      ).then((res) => {
        console.log("currentRequest", this.currentRequest)
        this.toastrService.success("Request updated successfully");
        this.resetForm();
        console.log("res", res);
        this.ngxService.stop();
        this.onUpdate.emit();
      }
      )
        .catch((error) => {
          this.ngxService.stop();
          this.toastrService.error("Something went wrong, Please try after sometime!");
          console.log("Error retrieving items: ", error);
        });
    }
  }
  getErrorMessage(): string {
    return "This field is required";
  }

  resetForm() {
    this.selectedRequestType = '';
    this.currentRequest = {
      items: [],
      totalAmount: 0
    };
  }

  showAlert(message: string, type: 'success' | 'error' | 'info') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  fetchPackmatCodeandName() {
    this.ngxService.start();
    this.inventoryService.getAllItems().then((items) => {
      if (items != undefined || items != null) {
        this.packmatCodes = items.map((item) => ({
          name: item.ProductName,
          code: item.PMCode,
        }))
        console.log("this.packmatCodes", this.packmatCodes);
        this.ngxService.stop();
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong , please try after some time",)
        console.log("Error retrieving items: ", error);
      });
  }
  fetchAddressList() {
    this.ngxService.start();
    this.gatepassService.getAllCustomerAddress().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        this.addresses = items.map((item) => {
          console.log("item.Author", item);
          return {
            id: item.ID,
            title: item.Title,
          };
        });
        console.log("categoryList", this.addresses)
        this.ngxService.stop();
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }

  changeStatusToPending(request: any) {
    console.log("requestId", request?.id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'submit'
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
        // this.processRequest(request, 'Pending')
        dialogRef.close();
      }
    );
  }

  fetchMetierList() {
    this.ngxService.start();
    this.gatepassService.getMetierList().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        this.metiers = items.map((item) => {
          console.log("item.Author", item);
          return item.Title
        });
        console.log("categoryList", this.metiers)
        this.ngxService.stop();
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }

  getFilteredRmCodes(input: string): string[] {
    const filterValue = (input || '')?.toLowerCase();
    return this.rmCodes
      .map(code => String(code))
      .filter(code => code?.toLowerCase()?.includes(filterValue))
      .slice(0, 100); // Show only first 100 matches
  }

  getFilteredPackmatCodes(input: string): { name: string; code: string }[] {
    const filterValue = (input || '').toLowerCase();

    const res = this.packmatCodes
      .filter(item =>
        !!item?.code &&
        item.code.toLowerCase().includes(filterValue)
      )
      .slice(0, 100); // Limit to 100 results
    console.log("res", res);
    return res;
  }
  // To open dropdown for a specific row
  showDropdown(i: number) {
    this.openDropdownIndex = i;
  }

  showDropdownForPackmatCode(i: number) {
    this.openDropdownIndexForPackmatCode = i;
  }

  // To close dropdown
  hideDropdown() {
    this.openDropdownIndex = null;
  }

  hideDropdownForPackmat() {
    this.openDropdownIndexForPackmatCode = null;
  }


  // selectRmCode(item: any, code: string, i: number) {
  //   console.log("code", code);
  //   console.log("item.rate", item.rate);
  //   item.rmCode = code;
  //   // Set price automatically
  //   item.rate = this.rmCodePriceMap.get(String(code))?.toFixed(2) || 0;
  //   console.log("item.rate", item.rate);
  //   this.calculateAmount(i);
  //   this.hideDropdown();
  // }
  selectRmCode(item: any, code: string, i: number) {
    item.rmCode = code;
    item.rate = Number(this.rmCodePriceMap.get(String(code))) || 0;
    this.calculateAmount(i);
    this.hideDropdown();
  }
  selectPackmatCode(item: any, code: string | undefined, i: number) {
    console.log("code", code);
    console.log("item", item);
    item.code = code;

    // const res = this.packmatCodes.find(item => item.code === code);
    // // Set price automatically
    // item.name = res?.name;
    this.calculateAmount(i);
    this.hideDropdownForPackmat();
  }
  onBlurDropdown() {
    setTimeout(() => this.hideDropdown(), 200);
  }
  onBlurDropdownForPackmatCode() {
    setTimeout(() => this.hideDropdownForPackmat(), 200);
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
        // this.dataSource = new MatTableDataSource(allItems);
        // if (this.paginator && this.sort) {
        //   this.dataSource.paginator = this.paginator;
        //   this.dataSource.sort = this.sort;
        // }
        this.currentRequest = {
          ...this.currentRequest,
          items: allItems
        };
        this.calculateTotalAmount();
        console.log("this.currentRequest", this.currentRequest);
        this.ngxService.stop();
      }
    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong, Please try after sometime!")
        console.log("Error retrieving items: ", error);
      });
  }
  isNumber(val: any): boolean {
    return typeof val === 'number' && !isNaN(val);
  }
}
