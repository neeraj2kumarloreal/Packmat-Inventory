import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
export interface catalogData {
  id: number;
  name: string;
  code: string;
  image: string;
  forecastQuantity: number;
}
@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  baseUrl: string = "https://loreal.sharepoint.com"
  editedRowIndex: number = -1;
  updatedCatalogData: catalogData[] = [];
  currentRow: catalogData = {
    id: 0,
    name: "",
    code: "",
    image: "",
    forecastQuantity: 0
  };
  displayedColumns: string[] = ['name', 'code', 'image', 'forecastQuantity', 'actions'];

  dataSource = new MatTableDataSource<catalogData>([]);
  constructor(private inventoryService: InventoryService, private ngxService: NgxUiLoaderService, private toastrService: ToastrService) {
  }
  ngAfterViewInit(): void {
    // if (this.paginator && this.sort) {
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // }
  }
  ngOnInit(): void {
    this.fetchCatalogList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter) || data.code.toLowerCase().includes(filter);
    };
  }

  fetchCatalogList() {
    this.ngxService.start();
    this.inventoryService.getAllItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => ({
          id: item.ID,
          name: item.ProductName,
          code: item.PMCode,
          image: this.baseUrl + item.FileRef,
          forecastQuantity: item.ForecastQuantity || 0,
        }))
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
  startEditing(row: catalogData) {
    this.editedRowIndex = row.id;
    this.currentRow = { ...row }; // Creates a shallow copy
    console.log("startEditing updatedCatalogData", this.updatedCatalogData)
  }
  cancelEditing(row: catalogData) {
    console.log("row", row);
    const existingUserIndex = this.dataSource.data.findIndex((user: catalogData) => user.id === row.id);
    console.log("existingUserIndex", existingUserIndex);
    if (existingUserIndex !== -1) {
      this.dataSource.data[existingUserIndex] = { ...this.currentRow };
      this.dataSource._updateChangeSubscription();
    }
    this.editedRowIndex = -1;


    console.log("this.dataSource.data", this.dataSource.data);
    console.log("currentRow", this.currentRow);
    this.currentRow = { id: 0, name: "", code: "", image: "", forecastQuantity: 0 }; // Reset currentRow after cancelling

  }
  saveRow(row: catalogData) {
    // Perform the save operation here, such as making an API call
    console.log('Saving row', row);
    const existingUserIndex = this.updatedCatalogData.findIndex((user: catalogData) => user.id === row.id);

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

  submitForecast() {
    this.ngxService.start();
    this.inventoryService.updateMultipleListItemsByIds(this.updatedCatalogData)
      .then(updatedItems => {
        console.log("submitForecast ", updatedItems);
        this.toastrService.success("Forecast submitted successfully!");
        this.ngxService.stop();
      })
      .catch(error => {
        console.log("submitForecast error", error);
        this.toastrService.error("Something went wrong,", error?.message);
        this.ngxService.stop();
      });
  }

  shouldDisableEditButton(row: catalogData) {
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
