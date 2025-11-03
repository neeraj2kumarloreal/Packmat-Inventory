import { DatePipe } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { CommonService } from 'src/app/services/common/common.service';
import { ForecastService } from 'src/app/services/forecast.service';

export interface forecastData {
  id: number;
  name: string;
  code: string;
  image: string;
  forecastQuantity: number;
  reason: string;
}

@Component({
  selector: 'app-list-forecast',
  templateUrl: './list-forecast.component.html',
  styleUrls: ['./list-forecast.component.scss'],
  providers: [DatePipe]
})
export class ListForecastComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  // @ViewChild('imageContainer') imageContainer!: ElementRef;
  @ViewChildren('imageContainer') imageContainers!: QueryList<ElementRef>;
  isForecastEnabled: boolean = false;


  baseUrl: string = "https://loreal.sharepoint.com"
  editedRowIndex: number = -1;
  updatedForecastData: forecastData[] = [];
  currentRow: forecastData = {
    id: 0,
    name: "",
    code: "",
    image: "",
    forecastQuantity: 0,
    reason: "",
  };
  forecastStatusData: any;
  displayedColumns: string[] = ['name', 'code', 'image', 'forecastQuantity', 'reason', 'actions'];

  dataSource = new MatTableDataSource<forecastData>([]);
  forecastQuantityData: any;
  currentUserRole: any;
  constructor(private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private commonService: CommonService, private forecastService: ForecastService, private catalogService: CatalogService, private router: Router) {
  }
  ngAfterViewInit(): void {
    console.log("this.imageContainers", this.imageContainers);
    // Subscribe to changes in imageContainers to handle dynamic table cell rendering
    this.imageContainers.changes.subscribe(() => {
      this.imageContainers.forEach((imageContainer) => {
        const containerElement = imageContainer.nativeElement;

        containerElement.addEventListener('mouseenter', (event: any) => {
          const largeImage = containerElement.querySelector('.large-image');
          const containerRect = containerElement.getBoundingClientRect();
          const largeImageRect = largeImage.getBoundingClientRect();

          const top = containerRect.top - largeImageRect.height;
          const left = containerRect.left + containerRect.width / 2 - largeImageRect.width / 2;

          largeImage.style.top = `${top}px`;
          largeImage.style.left = `${left}px`;
          largeImage.style.opacity = '1';
        });

        containerElement.addEventListener('mouseleave', (event: any) => {
          const largeImage = containerElement.querySelector('.large-image');
          largeImage.style.opacity = '0';
        });
      });
    });



  }

  ngOnInit(): void {
    this.currentUserRole = localStorage.getItem("role");
    if (!this.commonService.hasAccess('Forecast')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.getForecastStatus();
    this.fetchCatalogList();
    // this.fetchForecastList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter) || data.code.toLowerCase().includes(filter);
    };
  }

  fetchCatalogList() {
    this.ngxService.start();
    this.catalogService.getAllItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          return {
            id: item.ID,
            name: item.ProductName,
            code: item.PMCode,
            // image: this.baseUrl + item.FileRef,
            image: `${this.baseUrl + item.FileRef}?t=${new Date().getTime()}`
            ,
            forecastQuantity: 0,
            reason: "",
          };
        });
        console.log("items", allItems)
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
        console.log("Error retrieving items: ", error);
      });
  }

  startEditing(row: forecastData) {
    this.editedRowIndex = row.id;
    this.currentRow = { ...row }; // Creates a shallow copy
    console.log("startEditing updatedForecastData", this.updatedForecastData)
  }
  cancelEditing(row: forecastData) {
    console.log("row", row);
    const existingUserIndex = this.dataSource.data.findIndex((user: forecastData) => user.id === row.id);
    console.log("existingUserIndex", existingUserIndex);
    if (existingUserIndex !== -1) {
      this.dataSource.data[existingUserIndex] = { ...this.currentRow };
      this.dataSource._updateChangeSubscription();
    }
    this.editedRowIndex = -1;


    console.log("this.dataSource.data", this.dataSource.data);
    console.log("currentRow", this.currentRow);
    this.currentRow = { id: 0, name: "", code: "", image: "", forecastQuantity: 0, reason: "" }; // Reset currentRow after cancelling

  }
  saveRow(row: forecastData) {
    // Perform the save operation here, such as making an API call
    console.log('Saving row', row);
    if (row.forecastQuantity > 0) {
      const existingUserIndex = this.updatedForecastData.findIndex((user: forecastData) => user.id === row.id);

      if (existingUserIndex !== -1) {
        // Update the existing user in updatedForecastData
        this.updatedForecastData[existingUserIndex] = { ...row };
      } else {
        // If not found in updatedForecastData (but has an ID), it's likely from the original array
        // Decide whether to add it to updatedForecastData or handle it differently based on your logic.
        this.updatedForecastData.push({ ...row });
      }
    } else {
      row.forecastQuantity = 0;
    }
    this.editedRowIndex = -1;
    console.log("updatedForecastData", this.updatedForecastData)
  }

  submitForecast() {
    this.ngxService.start();
    this.forecastService.addMultipleListItems(this.updatedForecastData)
      .then(updatedItems => {
        console.log("Forecast ", updatedItems);
        this.toastrService.success("Forecast submitted Successfully.");
        this.ngxService.stop();
        this.fetchCatalogList();
      })
      .catch(error => {
        console.log("StockIn error", error);
        this.toastrService.error("Something went wrong,", error?.message);
        this.ngxService.stop();
      });
  }

  shouldDisableEditButton(row: forecastData) {
    if (!this.isForecastEnabled) {
      return true;
    }
    if (this.editedRowIndex === -1) {
      return false;
    } else if (row.id !== this.editedRowIndex) {
      return true;
    }
    return false;
  }

  applyFilter(event: Event) {
    // now applies filtering only to 'name' and 'code' columns since we defined filterPredicate.
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getForecastStatus() {
    this.ngxService.start();
    this.commonService.getItemByTitle('Forecast Page').then((res: any) => {
      console.log("res", res);
      console.log("isForecastEnabled", this.isForecastEnabled);
      const item = res?.at(0);
      this.forecastStatusData = item;
      console.log("item", item);
      this.isForecastEnabled = item?.Status === 'Enabled'
      console.log("isForecastEnabled", this.isForecastEnabled);
      this.ngxService.stop();
    }).catch((error: any) => {
      this.ngxService.stop();
      this.toastrService.error("Something went wrong, please try after some time!");
      this.router.navigate(['/']);
    })
  }

  handleToggleChange(event: MatSlideToggleChange) {
    this.ngxService.start();
    console.log("event", event);
    console.log("event.target", event?.checked);
    const status = event?.checked ? 'Enabled' : 'Disabled';
    this.commonService.updateForecastPageStatus(this.forecastStatusData?.ID, status).then((res: any) => {
      console.log("res", res);
      this.isForecastEnabled = event?.checked
      this.toastrService.success(`Forecast ${status} successfully`);
      this.ngxService.stop();
    }).catch((error: any) => {
      this.ngxService.stop();
      this.toastrService.error("Something went wrong, please try after some time!");
    })
  }
}
