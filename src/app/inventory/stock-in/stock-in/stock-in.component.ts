import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ForecastService } from 'src/app/services/forecast.service';
import { StockInService } from 'src/app/services/stock-in/stock-in.service';

export interface stockInData {
  id: number;
  name: string;
  code: string;
  image: string;
  forecastQuantity: number;
  availableQuantity: number;
  needToOrderQuantity: number;
  actualOrdredQuantity: number;
}

@Component({
  selector: 'app-stock-in',
  templateUrl: './stock-in.component.html',
  styleUrls: ['./stock-in.component.scss']
})
export class StockInComponent {

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChildren('imageContainer') imageContainers!: QueryList<ElementRef>;

  baseUrl: string = "https://loreal.sharepoint.com"
  editedRowIndex: number = -1;
  updatedCatalogData: stockInData[] = [];
  currentRow: stockInData = {
    id: 0,
    name: "",
    code: "",
    image: "",
    forecastQuantity: 0,
    availableQuantity: 0,
    needToOrderQuantity: 0,
    actualOrdredQuantity: 0
  };
  displayedColumns: string[] = ['name', 'code', 'image', 'forecastQuantity', 'availableQuantity',  'actualOrdredQuantity', 'actions'];

  dataSource = new MatTableDataSource<stockInData>([]);
  forecastQuantityData: any;
  constructor(private stockInService: StockInService, private ngxService: NgxUiLoaderService, private toastrService: ToastrService, private commonService: CommonService, private forecastService: ForecastService,private router: Router) {
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
    if (!this.commonService.hasAccess('Stock In')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    // this.fetchCatalogList();
    this.fetchForecastList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter) || data.code.toLowerCase().includes(filter);
    };
  }

  fetchCatalogList() {
    this.ngxService.start();
    this.stockInService.getAllItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => {
          const forecastQty = this.commonService.calculateTotalForecastQuantity(item.PMCode, this.forecastQuantityData);
          const availableQty = item.AvailableQuantity || 0;
          const needToOrderQty = forecastQty > availableQty ? forecastQty - availableQty : 0;

          return {
            id: item.ID,
            name: item.ProductName,
            code: item.PMCode,
            // image: this.baseUrl + item.FileRef,
            image:`${this.baseUrl + item.FileRef}?t=${new Date().getTime()}`
            ,
            forecastQuantity: forecastQty,
            availableQuantity: availableQty,
            needToOrderQuantity: needToOrderQty,
            actualOrdredQuantity: 0,
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
        console.log("Error retrieving items: ", error);
      });
  }
  startEditing(row: stockInData) {
    this.editedRowIndex = row.id;
    this.currentRow = { ...row }; // Creates a shallow copy
    console.log("startEditing updatedCatalogData", this.updatedCatalogData)
  }
  cancelEditing(row: stockInData) {
    console.log("row", row);
    const existingUserIndex = this.dataSource.data.findIndex((user: stockInData) => user.id === row.id);
    console.log("existingUserIndex", existingUserIndex);
    if (existingUserIndex !== -1) {
      this.dataSource.data[existingUserIndex] = { ...this.currentRow };
      this.dataSource._updateChangeSubscription();
    }
    this.editedRowIndex = -1;


    console.log("this.dataSource.data", this.dataSource.data);
    console.log("currentRow", this.currentRow);
    this.currentRow = { id: 0, name: "", code: "", image: "", forecastQuantity: 0, availableQuantity: 0, needToOrderQuantity: 0, actualOrdredQuantity: 0 }; // Reset currentRow after cancelling

  }
  saveRow(row: stockInData) {
    // Perform the save operation here, such as making an API call
    console.log('Saving row', row);
    const existingUserIndex = this.updatedCatalogData.findIndex((user: stockInData) => user.id === row.id);

    if (existingUserIndex !== -1) {
      // Update the existing user in updatedCatalogData
      this.updatedCatalogData[existingUserIndex] = { ...row };
    } else {
      // If not found in updatedCatalogData (but has an ID), it's likely from the original array
      // Decide whether to add it to updatedCatalogData or handle it differently based on your logic.
      this.updatedCatalogData.push({ ...row });
    }
    this.editedRowIndex = -1;
    console.log("updatedCatalogData", this.updatedCatalogData)
  }

  StockIn() {
    this.ngxService.start();
    this.stockInService.updateMultipleListItemsByIds(this.updatedCatalogData)
      .then(updatedItems => {
        console.log("StockIn ", updatedItems);
        this.toastrService.success("Stock-in completed successfully.");
        this.ngxService.stop();
        this.fetchForecastList();
      })
      .catch(error => {
        console.log("StockIn error", error);
        this.toastrService.error("Something went wrong,", error?.message);
        this.ngxService.stop();
      });
  }

  shouldDisableEditButton(row: stockInData) {
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



}
