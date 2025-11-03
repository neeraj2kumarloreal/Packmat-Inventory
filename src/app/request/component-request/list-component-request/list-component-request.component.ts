import { DatePipe } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ComponentRequestService } from 'src/app/services/component-request/component-request.service';
import { ProcessRequestComponent } from '../process-request/process-request.component';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
export interface componentRequestData {
  id: number;
  purpose: string;
  code: string;
  requestedQuantity: number;
  metierAndProjectName: string;
  requestedBy: string;
  status: string;
  dgReferenceNumber: string;
  requestDate: string;
  application: string;
  isReqPartOfYearlyForecast: string;
  requiredDate: string;
  name: string;
  image: string;
}
@Component({
  selector: 'app-list-component-request',
  templateUrl: './list-component-request.component.html',
  styleUrls: ['./list-component-request.component.scss'],
  providers: [DatePipe]
})
export class ListComponentRequestComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  currentUserRole: string = '';
  isAdmin: boolean = false;
  updatedForecastData: componentRequestData[] = [];
  displayedColumns: string[] = ['name', 'code', 'requestedQuantity', 'status', 'actions'];

  dataSource = new MatTableDataSource<componentRequestData>([]);
  constructor(private dialog: MatDialog, private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private commonService: CommonService, private componentRequestService: ComponentRequestService, private router: Router, private activatedRoute: ActivatedRoute, private datePipe: DatePipe) {
  }


  ngOnInit(): void {
    if (!this.commonService.hasAccess('Component Request')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.currentUserRole = localStorage.getItem("role") || '';
    this.isAdmin = this.currentUserRole === 'R&I Admin' || this.currentUserRole === 'Pune DG Admin' || this.currentUserRole === 'Transport Admin'
    this.fetchComponentRequestList();
    // this.fetchForecastList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.code.toLowerCase().includes(filter);
    };
  }

  fetchComponentRequestList() {
    this.ngxService.start();
    let res;
    if (this.isAdmin) {
      res = this.componentRequestService.getAllItems();
    } else {
      res = this.componentRequestService.getAllItemsByCurrentUser();
    }
    res.then((items) => {
      console.log("updated items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          console.log("item.Author", item);
          return {
            id: item.ID,
            code: item.Title,
            requestedQuantity: item.RequestedQuantity,
            metierAndProjectName: item.MetierAndProjectName,
            purpose: item.Purpose,
            // requestedBy: item.Author.$DI_1,
            requestedBy: String(Object.values(item.Author).at(1)),
            status: item.Status,
            dgReferenceNumber: item.DGReferenceNumber,
            requestDate: this.formatDate(item.Created),
            application: item.Application,
            isReqPartOfYearlyForecast: item.IsReqPartOfYearlyForecast,
            requiredDate: this.formatDate(item.RequiredDate),
            name: item.ProductName,
            image: item.ImageURL,
            // image: item.ImageURL + `?t=${new Date().getTime()}`,
          };
        });
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

  handleAddAction() {
    this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }


  handleProcessRequest(row: any) {
    console.log("row", row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Process',
      componentRequestForm: row
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      // dialogConfig.height= '100%',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ProcessRequestComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onProcessRequest.subscribe(
      (response) => {
        dialogRef.close();
        this.fetchComponentRequestList();
      }
    );

  }
  applyFilter(event: Event) {
    // now applies filtering only to 'name' and 'code' columns since we defined filterPredicate.
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Under Review':
        return 'pending-request';
      case 'In Progress':
        return 'in-progress-request';
      case 'Approved':
        return 'approved-request';
      case 'Dispatched':
        return 'in-transit-request';
      case 'Received':
        return 'received-request';
      case 'Rejected':
        return 'rejected-request';
      default:
        return '';
    }
  }

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd/MM/yyyy") || "";
  }

  shouldDisableProcessRequestIcon(status: string) {
    switch (status) {
      case 'Under Review':
        return this.currentUserRole === 'Transport Admin' || this.currentUserRole === 'Pune DG Admin';
      case 'In Progress':
        return this.currentUserRole === 'Transport Admin' || this.currentUserRole === 'R&I Admin';
      case 'Approved':
        return this.currentUserRole === 'Pune DG Admin' || this.currentUserRole === 'R&I Admin';
      case 'Dispatched':
        return this.currentUserRole === 'Pune DG Admin' || this.currentUserRole === 'Transport Admin';
      default:
        return true;
    }
  }

  handleView(row: any) {
    console.log("row", row);
    localStorage.setItem("data", JSON.stringify(row));
    this.router.navigate(['view'], { relativeTo: this.activatedRoute });
  }

  getStatusText(status: string) {
    switch (status) {
      case 'Approved':
        return 'Approved by DG'
      case 'Dispatched':
        return 'Dispatched by DG'
      default:
        return status;
    }
  }
}
