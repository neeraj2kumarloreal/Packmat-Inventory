import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ComponentRequestService } from 'src/app/services/component-request/component-request.service';
import { ForecastService } from 'src/app/services/forecast.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
import * as XLSX from 'xlsx';
export interface reportData {
  id: number;
  name: string;
  code: string;
  image: string;
  forecastQuantity: number;
  availableQuantity: number;
  requestedQuantity: number;
}
@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss']
})
export class ReportPageComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChildren('imageContainer') imageContainers!: QueryList<ElementRef>;

  baseUrl: string = "https://loreal.sharepoint.com"
  forecastQuantityData: any = [];

  displayedColumns: string[] = ['name', 'code',  'forecastQuantity','requestedQuantity', 'availableQuantity',];
  allItems:any;

  dataSource = new MatTableDataSource<reportData>([]);
  componentRequestData: any;
  constructor(private inventoryService: InventoryService, private forecastService: ForecastService,
     private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private router: Router,
      private activatedRoute: ActivatedRoute, private commonService: CommonService,private componentRequestService:ComponentRequestService) {
  }
  ngAfterViewInit(): void {
  
  }
  ngOnInit(): void {
    if (!this.commonService.hasAccess('Report')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.fetchForecastList();
    // this.fetchReportList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter) || data.code.toLowerCase().includes(filter);
    };
  }

  fetchReportList() {
    // this.ngxService.start();
    this.inventoryService.getAllItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
         this.allItems = items.map((item) => {
          const forecastQty = this.commonService.calculateTotalForecastQuantity(item.PMCode, this.forecastQuantityData) || 0;
          const availableQty = item.AvailableQuantity || 0;
          const requestedQty = this.commonService.calculateTotalRequestedQuantity(item.PMCode,this.componentRequestData) || 0;
          return {
            id: item.ID,
            name: item.ProductName,
            code: item.PMCode,
            forecastQuantity: forecastQty,
            requestedQuantity: requestedQty,
            availableQuantity: availableQty,
            // image: this.baseUrl + item.FileRef,
          }

        })
        console.log("items", this.allItems)
        this.dataSource = new MatTableDataSource(this.allItems);
        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        this.ngxService.stop();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong , please try after some time");
        console.log("Error retrieving items: ", error);
      });
  }

  fetchForecastList() {
    this.ngxService.start();
    this.forecastService.getItemsByYear(new Date().getFullYear()).then((items) => {
      if (items != undefined || items != null) {
        this.forecastQuantityData = items.map((item) => ({
          ID: item.ID,
          productName: item.ProductName,
          code: item.Title,
          forecastQuantity: item.ForecastQuantity,
          imageURL: item?.ProductImageURL?.$2_1,
          createdDate: item.Created
        }))
        console.log("this.forecastQuantityData", this.forecastQuantityData);
        // this.ngxService.stop();
        this.fetchComponentRequestList();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong , please try after some time");
        console.log("Error retrieving items: ", error);
      });
  }

  fetchComponentRequestList() {
    // this.ngxService.start();
    this.componentRequestService.getItemsByYearAndStatus(new Date().getFullYear()).then((items) => {
      console.log("fetchComponentRequestList",items)
      if (items != undefined || items != null) {
        this.componentRequestData = items.map((item) => ({
          ID: item.ID,
          productName: item.ProductName,
          code: item.Title,
          status:item?.Status,
          requestedQuantity:item?.RequestedQuantity
        }))
        console.log("this.componentRequestData", this.componentRequestData);
        // this.ngxService.stop();
        this.fetchReportList();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        this.toastrService.error("Something went wrong , please try after some time")
        console.log("Error retrieving items: ", error);
      });
  }
  // calculateTotalForecastQuantity(code: string): number {
  //   return this.forecastQuantityData.reduce((sum: number, item: any) => {
  //     return item.code === code ? sum + item.forecastQuantity : sum;
  //   }, 0);
  // }

  applyFilter(event: Event) {
    // now applies filtering only to 'name' and 'code' columns since we defined filterPredicate.
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  handleViewAction(element: any) {
    console.log("element", element);
    localStorage.setItem("forecastData", JSON.stringify(element));
    this.router.navigate(['view'], { relativeTo: this.activatedRoute });
  }

  downloadXlsxFile() {
    //XLSX.writeFile(this.exportData, "Report.xlsb");
    /* generate worksheet and workbook */
    const worksheet = XLSX.utils.json_to_sheet(this.allItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    /* fix headers */
    XLSX.utils.sheet_add_aoa(worksheet, [['ID', 'Name', 'Code', 'Total Forecast Quantity', 'Total Requested Quantity', 'Available Quantity']], { origin: "A1" });
    // XLSX.utils.sheet_add_aoa(worksheet, [['title', 'requestedBy', 'startDate', 'endDate', 'status']], { origin: "A1" });

    /* calculate column width */
    // const max_width = this.exportData.reduce((w, r) => Math.max(w, r.name.length), 10);
    // worksheet["!cols"] = [ { wch: max_width } ];

    /* create an XLSX file and try to save to Presidents.xlsx */
    XLSX.writeFile(workbook, "report.xlsx");

    // this.filterForm.reset();
    // this.PairedComparisonResultList = this.SuperPairedComparisonResultList;
  }

}

