import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
import { AddItemComponent } from '../add-item/add-item/add-item.component';
import { ViewEditItemComponent } from '../view-edit-item/view-edit-item.component';


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
@Component({
  selector: 'app-list-catalog',
  templateUrl: './list-catalog.component.html',
  styleUrls: ['./list-catalog.component.scss']
})
export class ListCatalogComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);;
  displayedColumns: any = ["name", "code", "category", "quantity", "image", "actions"];
  baseUrl: string = "https://loreal.sharepoint.com"
  currentUserRole: string = ''
  // displayedColumns: any = ["name", "actions"];
  @ViewChildren('imageContainer') imageContainers!: QueryList<ElementRef>;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;


  constructor(private dialog: MatDialog, private router: Router, private inventoryService: InventoryService, private ngxService: NgxUiLoaderService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.currentUserRole = localStorage.getItem("role") || ''
    // this.inventoryService.getUserDetails();
    const notAllowedRoles = [
      'Gatepass Admin',
      'Gatepass User',
    ];
    
    if (!this.currentUserRole || notAllowedRoles.includes(this.currentUserRole)) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/home']);
      return;
    }

    this.fetchCatalogList();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.ProductName.toLowerCase().includes(filter) || data.Code.toLowerCase().includes(filter);
    };
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
  // ngAfterViewInit(): void {
  //   this.imageContainers.changes.subscribe(() => {
  //     this.imageContainers.forEach((imageContainer) => {
  //       const containerElement = imageContainer.nativeElement;

  //       containerElement.addEventListener('mouseenter', () => {
  //         const largeImage = containerElement.querySelector('.large-image');
  //         const containerRect = containerElement.getBoundingClientRect();
  //         const largeImageRect = largeImage.getBoundingClientRect();

  //         const top = containerRect.top + (containerRect.height / 2) - (largeImageRect.height / 2); // Center vertically
  //         const left = containerRect.right; // Position to the right

  //         largeImage.style.top = `${top}px`;
  //         largeImage.style.left = `${left}px`;
  //         largeImage.style.opacity = '1';
  //       });

  //       containerElement.addEventListener('mouseleave', () => {
  //         const largeImage = containerElement.querySelector('.large-image');
  //         largeImage.style.opacity = '0';
  //       });
  //     });
  //   });
  // }

  fetchCatalogList() {
    this.ngxService.start();
    this.inventoryService.getAllItems().then((items) => {

      if (items != undefined || items != null) {
        const allItems = items.map((item) => ({
          ID: item.ID,
          ProductName: item.ProductName,
          Code: item.PMCode,
          Category: item.Category,
          Type: item?.ProductType,
          Quantity: item.AvailableQuantity,
          // Image: this.baseUrl + item.FileRef
          Image: `${this.baseUrl + item.FileRef}?t=${new Date().getTime()}`

        }))
        console.log("allItems", allItems);
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
        this.toastrService.error("Something went wrong , please try after some time",)
        console.log("Error retrieving items: ", error);
      });
  }


  handleAddAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Add',
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      // dialogConfig.height= '100%',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(AddItemComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onComponentAdd.subscribe(
      (response) => {
        dialogRef.close();
        this.fetchCatalogList();
        // this.fetchComponentRequestList();
      }
    );

  }
  handleEditAction(row: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Edit',
      formData: row
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      // dialogConfig.height= '100%',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ViewEditItemComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onComponentEditOrView.subscribe(
      (response) => {
        dialogRef.close();
        this.fetchCatalogList();
        // this.fetchComponentRequestList();
      }
    );

  }
  handleViewAction(row: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'View',
      formData: row
    };
    dialogConfig.maxWidth = '90vw',
      dialogConfig.maxHeight = '100vh',
      // dialogConfig.height= '100%',
      dialogConfig.width = '90%'
    const dialogRef = this.dialog.open(ViewEditItemComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onComponentEditOrView.subscribe(
      (response) => {
        dialogRef.close();
        // this.fetchCatalogList();
        // this.fetchComponentRequestList();
      }
    );

  }
  applyFilter(event: Event) {
    // now applies filtering only to 'name' and 'code' columns since we defined filterPredicate.
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
