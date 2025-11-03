import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ExcelService } from 'src/app/services/excel-service/excel.service';
import { GatepassService } from 'src/app/services/gatepass/gatepass.service';
import { RequestType, BaseRequest, RequestItem } from 'src/app/types/request.types';
import { ViewRequestComponent } from '../view-request/view-request.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { RequestService } from 'src/app/services/request.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
import { EditGatepassRequestComponent } from '../edit-gatepass-request/edit-gatepass-request.component';

@Component({
  selector: 'app-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent {
  displayedColumns: string[] = ['id', 'requestType', 'status', 'createdDate', 'totalAmount', 'actions'];
  // Example métiers list
  metiers: string[] = [];
  // In your component.ts
  rmCodes: string[] = [];
  rmCodePriceMap = new Map<string, number>();

  packmatCodes: any[] = [];


  // For tracking which dropdown is open (by row index)
  openDropdownIndex: number | null = null;
  openDropdownIndexForPackmatCode: number | null = null;


  selectedRequestType: RequestType | '' = '';
  currentRequest: Partial<BaseRequest> = {
    items: [],
    totalAmount: 0
  };
  myRequests: any = [];
  isDragOver = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  // In your component.ts
  addresses: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(
    private excelService: ExcelService,
    private ngxService: NgxUiLoaderService,
    private gatepassService: GatepassService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private router: Router,
    private commonService: CommonService,
    private requestService: RequestService,
    private inventoryService: InventoryService
  ) { }

  async ngOnInit() {
    this.fetchAddressList();
    this.fetchMetierList();
    this.fetchMyPreviousRequestList();
    const { codes, priceMap } = await this.excelService.fetchRawMaterialExcelFile();
    this.rmCodes = codes;
    this.rmCodePriceMap = priceMap;
    this.fetchPackmatCodeandName();
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
    this.currentRequest.items!.forEach((item, i) => {
      item.srNo = i + 1;
    });
    this.calculateTotalAmount();
  }

  calculateAmount(index: number) {
    const item = this.currentRequest.items![index];
    if (item) {
      item.amount = item.quantity * item.rate;
      this.calculateTotalAmount();
    }
  }

  calculateTotalAmount() {
    this.currentRequest.totalAmount = this.currentRequest.items!.reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalAmount(): number {
    return this.currentRequest.totalAmount || 0;
  }

  // Excel Upload Methods
  downloadTemplate() {
    let result = this.selectedRequestType.replace(" ", "");
    console.log(result);
    if (this.selectedRequestType) {
      this.commonService.downloadTemplate(result);
      // this.showAlert('Template downloaded successfully!', 'success');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processExcelFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processExcelFile(file);
    }
  }

  async processExcelFile(file: File) {
    if (!this.selectedRequestType) {
      // this.showAlert('Please select a request type first', 'error');
      this.toastrService.error("Please select a request type first");

      return;
    }

    try {
      const data = await this.excelService.parseExcelFile(file);
      const items = this.excelService.convertExcelDataToItems(data, this.selectedRequestType as RequestType);


      this.currentRequest.items = items;
      this.calculateTotalAmount();
      // this.showAlert(`Successfully imported ${items.length} items from Excel`, 'success');
      this.toastrService.success(`Successfully imported ${items.length} items from Excel`);
    } catch (error) {
      // this.showAlert('Failed to process Excel file. Please check the format.', 'error');
      this.toastrService.error('Failed to process Excel file. Please check the format.');
    }
  }

  // isFormValid(): boolean {
  //   if (!this.selectedRequestType || !this.currentRequest.address) return false;
  //   if (this.selectedRequestType === 'Raw Material' && !this.currentRequest.customerName && !this.currentRequest.noOfPackages && this.currentRequest.weight) return false;
  //   return this.currentRequest.items!.length > 0;
  // }
  isFormValid(): boolean {
    // Check all required fields for all request types
    if (
      !this.selectedRequestType ||
      !this.currentRequest.address ||
      !this.currentRequest.customerName ||
      !this.currentRequest.noOfPackages ||
      !this.currentRequest.weight
    ) {
      return false;
    }

    // Check at least one item is present
    return Array.isArray(this.currentRequest.items) && this.currentRequest.items.length > 0;
  }

  saveDraft() {
    if (this.isFormValid()) {
      this.ngxService.start();
      this.gatepassService.createGatepassRequest({
        ...this.currentRequest as BaseRequest,
        status: 'Draft'
      }).then((res) => {
        console.log("currentRequest", this.currentRequest)
        this.toastrService.success("Your request has been saved as a draft successfully.");
        this.resetForm();
        this.fetchMyPreviousRequestList();
        console.log("res", res);
        this.ngxService.stop();
      }
      )
        .catch((error) => {
          this.ngxService.stop();
          this.toastrService.error("Something went wrong, Please try after sometime!");
          console.log("Error retrieving items: ", error);
        });
    }
    // if (this.isFormValid()) {
    //   this.requestService.createRequest({
    //     ...this.currentRequest as BaseRequest,
    //     status: 'Draft'
    //   });
    //   // this.showAlert('Request saved as draft', 'success');
    //   this.toastrService.success("Request saved as draft");
    //   this.resetForm();
    //   this.fetchMyPreviousRequestList();
    // }
  }

  submitRequest() {
    if (this.isFormValid()) {
      this.ngxService.start();
      this.gatepassService.createGatepassRequest({
        ...this.currentRequest as BaseRequest,
        status: 'Pending'
      }).then((res) => {
        console.log("currentRequest", this.currentRequest)
        this.toastrService.success("Request submitted successfully");
        this.resetForm();
        this.fetchMyPreviousRequestList();
        console.log("res", res);
        this.ngxService.stop();
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

  fetchMyPreviousRequestList() {
    this.ngxService.start();
    this.gatepassService.getAllGatepassRequestByCurrentUser().then((items) => {
      console.log("updated items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          console.log("item.Author", item);
          return {
            id: item?.ID,
            invoiceNumber: item?.InvoiceNo,
            requestType: item?.RequestType,
            requestStatus: item?.RequestStatus,
            subTotal: item?.SubTotal,
            customerName: item?.Title,
            customerEmail: item?.CustomerEmail,
            customerAddress: item?.CustomerAddress,
            createdDate: item?.Created,
            createdBy: String(Object.values(item?.Author).at(1)),
            noOfPackages: item?.NoOfPackages,
            weight: item?.Weight,
            secondaryApprovalRemark: item?.SecondaryApprovalRemark,
            finalApprovalRemark: item?.FinalApprovalRemark
            // requestedBy: item.Author.$DI_1,
          };
        });
        console.log("updated items", allItems)
        this.myRequests = new MatTableDataSource(allItems);
        if (this.paginator && this.sort) {
          this.myRequests.paginator = this.paginator;
          this.myRequests.sort = this.sort;
        }
        this.ngxService.stop();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong, Please try after sometime!");
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
    // const sub = dialogRef.componentInstance.onProcessRequest.subscribe(
    //   (response) => {
    //     dialogRef.close();
    //     this.fetchComponentRequestList();
    //   }
    // );

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
        this.processRequest(request, 'Pending')
        dialogRef.close();
      }
    );
  }

  processRequest(request: any, status: string) {
    this.ngxService.start();
    this.gatepassService.processGatepassRequest(request?.id, status, "").then((items) => {
      console.log("updated items", items)
      this.toastrService.success(`Request submitted successfully`);
      this.fetchMyPreviousRequestList();
    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong, Please try after sometime!");
        console.log("Error retrieving items: ", error);
      });
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

  // Filtered RM codes per row
  // getFilteredRmCodes(input: string): string[] {
  //   const filterValue = (input || '').toLowerCase();
  //   return this.rmCodes.filter(code => code.toLowerCase().includes(filterValue));
  // }

  getFilteredRmCodes(input: string): string[] {
    const filterValue = (input || '')?.toLowerCase();
    return this.rmCodes
      .map(code => String(code))
      .filter(code => code?.toLowerCase()?.includes(filterValue))
      .slice(0, 100); // Show only first 100 matches
  }

  // getFilteredPackmatCodes(input: string): string[] {
  //   const filterValue = (input || '').toLowerCase();
  //   return this.packmatCodes
  //     .filter((item: any) => item && item.code) // Filter out invalid items
  //     .map((item: any) => String(item.code))
  //     .filter(code => code.toLowerCase().includes(filterValue))
  //     .slice(0, 100); // Show only first 100 matches
  // }
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

  // To select a code
  // selectRmCode(item: any, code: string, i: number) {
  //   item.rmCode = code;
  //   this.calculateAmount(i);
  //   this.hideDropdown();
  // }
  selectRmCode(item: any, code: string, i: number) {
    console.log("code", code);
    console.log("item.rate", item.rate);
    item.rmCode = code;
    // Set price automatically
    item.rate = this.rmCodePriceMap.get(String(code))?.toFixed(2) || 0;
    console.log("item.rate", item.rate);
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

  handleEditRequest(row: any) {
    console.log("row", row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      requestDetails: row,
      approvalStatus: row?.requestStatus
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(EditGatepassRequestComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onUpdate.subscribe(
      (response) => {
        dialogRef.close();
        this.fetchMyPreviousRequestList();
      }
    );

  }

}
