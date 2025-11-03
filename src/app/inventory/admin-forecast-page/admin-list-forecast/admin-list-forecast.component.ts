import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ForecastService } from 'src/app/services/forecast.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
export interface catalogData {
  id: number;
  name: string;
  code: string;
  image: string;
  forecastQuantity: number;
  availableQuantity: number;
  needToOrderQuantity: number;
}
@Component({
  selector: 'app-admin-list-forecast',
  templateUrl: './admin-list-forecast.component.html',
  styleUrls: ['./admin-list-forecast.component.scss']
})
export class AdminListForecastComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChildren('imageContainer') imageContainers!: QueryList<ElementRef>;

  baseUrl: string = "https://loreal.sharepoint.com"
  editedRowIndex: number = -1;
  updatedCatalogData: catalogData[] = [];
  forecastQuantityData: any = [];
  currentRow: catalogData = {
    id: 0,
    name: "",
    code: "",
    image: "",
    forecastQuantity: 0,
    availableQuantity: 0,
    needToOrderQuantity: 0,
  };
  displayedColumns: string[] = ['name', 'code', 'image', 'forecastQuantity', 'availableQuantity',
    'needToOrderQuantity', 'actions'];

  dataSource = new MatTableDataSource<catalogData>([]);
  constructor(private inventoryService: InventoryService, private forecastService: ForecastService, private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private router: Router, private activatedRoute: ActivatedRoute, private commonService: CommonService) {
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
    if (!this.commonService.hasAccess('Forecast Overview')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.fetchForecastList();
    // this.fetchCatalogList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter) || data.code.toLowerCase().includes(filter);
    };
  }

  fetchCatalogList() {
    this.ngxService.start();
    this.inventoryService.getAllItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          const forecastQty = this.commonService.calculateTotalForecastQuantity(item.PMCode, this.forecastQuantityData) || 0;
          const availableQty = item.AvailableQuantity || 0;
          const needToOrderQty = forecastQty > availableQty ? forecastQty - availableQty : 0;

          return {
            id: item.ID,
            name: item.ProductName,
            code: item.PMCode,
            // image: this.baseUrl + item.FileRef,
            image: `${this.baseUrl + item.FileRef}?t=${new Date().getTime()}`,
            // forecastQuantity: this.commonService.calculateTotalForecastQuantity(item.PMCode, this.forecastQuantityData) || 0,
            forecastQuantity: forecastQty,
            availableQuantity: availableQty,
            needToOrderQuantity: needToOrderQty,
          }

        })
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

  fetchForecastList() {
    this.ngxService.start();
    this.forecastService.getItemsByYear(new Date().getFullYear()).then((items) => {
      if (items != undefined || items != null) {
        this.forecastQuantityData = items.map((item) => ({
          ID: item.ID,
          productName: item.ProductName,
          code: item.Title,
          forecastQuantity: item.ForecastQuantity,
          // imageURL: item?.ProductImageURL?.$2_1,
          imageURL: `item?.ProductImageURL?.$2_1?t=${new Date().getTime()}`,
          createdDate: item.Created
        }))
        console.log("this.forecastQuantityData", this.forecastQuantityData);
        this.ngxService.stop();
        this.fetchCatalogList();
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
}


