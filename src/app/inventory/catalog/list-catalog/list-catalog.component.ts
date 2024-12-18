import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { InventoryService } from 'src/app/services/inventory/inventory.service';


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
@Component({
  selector: 'app-list-catalog',
  templateUrl: './list-catalog.component.html',
  styleUrls: ['./list-catalog.component.scss']
})
export class ListCatalogComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<any>([]);;
  displayedColumns: any = ["name", "code", "category", "type", "quantity", "image", "actions"];
  baseUrl: string = "https://loreal.sharepoint.com"
  // displayedColumns: any = ["name", "actions"];


  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(private dialog: MatDialog, private router: Router, private inventoryService: InventoryService, private ngxService: NgxUiLoaderService) { }
  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.fetchCatalogList();
  }

  fetchCatalogList() {
    this.ngxService.start();
    this.inventoryService.getAllItems().then((items) => {
      console.log("items", items)
      if (items != undefined || items != null) {
        const allItems = items.map((item) => ({
          ID: item.ID,
          ProductName: item.ProductName,
          Code: item.PMCode,
          Category: item.Category?.$Cz_1,
          Type: item?.ProductType?.$Cz_1,
          Quantity: item.AvailableQuantity,
          Image: this.baseUrl + item.FileRef
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

  handleAddAction() {

  }
}
