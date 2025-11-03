import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, BehaviorSubject, map, of, startWith } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { ComponentRequestService } from 'src/app/services/component-request/component-request.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-component-request',
  templateUrl: './new-component-request.component.html',
  styleUrls: ['./new-component-request.component.scss'],
  providers: [DatePipe]
})
export class NewComponentRequestComponent {
  purposeList: string[] = ['Lab Development Activity', 'BUT', 'CUT', 'Other'];
  componentOptions: any[] = [];
  componentFilteredOptions: Observable<any[]>;
  componentRequestForm: FormGroup;
  today: any = "";
  DGRefNo: string = "";
  selectedComponent: any;
  availableQuantity: number = 0;
  imageURL: string = '';
  baseURL: string=environment.baseURL

  private allItemsSubject = new BehaviorSubject<any[]>([]);

  constructor(private inventoryService: InventoryService, private componentRequestService: ComponentRequestService, private ngxService: NgxUiLoaderService, 
    private formBuilder: FormBuilder, private toastrService: ToastrService, private router: Router,private commonService:CommonService) {
    this.componentFilteredOptions = this.allItemsSubject.asObservable(); // Create observable
    this.componentRequestForm = this.formBuilder.group({
      componentCode: ['', [Validators.required]],
      requestedQuantity: ['', [Validators.required]],
      // , Validators.max
      requiredDate: ['', [Validators.required]],
      purpose: ['', [Validators.required]],
      metierAndProjectName: ['', [Validators.required]],
      application: ['', [Validators.required]],
      isReqPartOfYearlyForecast: ['Yes', [Validators.required]],
      availableQuantity: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.commonService.hasAccess('Component Request')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.today = new Date();
    this.getTodaysRequestCount();
    this.fetchComponentList()
    this.componentFilteredOptions = this.componentRequestForm.get('componentCode')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    ) ?? of([]); // Provide a default empty observable
  }

  fetchComponentList() {
    this.ngxService.start();
    this.inventoryService.getAllItems()
      .then((items: any[]) => {  // Type the items parameter
        if (items) { // Simplified check
          console.log("items", items);
          this.componentOptions = items.map((item) => ({
            ID: item.ID,
            ProductName: item.ProductName,
            Code: item.PMCode,
            Quantity: item.AvailableQuantity,
            // Image: this.baseURL + item.FileRef
            Image: `${this.baseURL + item.FileRef}?t=${new Date().getTime()}`
          }));
          this.allItemsSubject.next(this.componentOptions); // Update the BehaviorSubject
        } else {
          this.allItemsSubject.next([]); // Update with an empty array if items is null/undefined
        }
        this.ngxService.stop();
      })
      .catch((error) => {
        this.ngxService.stop();
        console.error("Error retrieving items:", error); // Use console.error for errors
        this.allItemsSubject.next([]); // Handle the error state
      });
  }

  getTodaysRequestCount() {
    this.ngxService.start();
    this.componentRequestService.getAllItemsByTodaysDate(this.today)
      .then((count: number) => {  // Type the items parameter
        console.log("getTodaysRequestCount-count", count);
        this.generateDGRefNo(count + 1)
        this.ngxService.stop();
      })
      .catch((error) => {
        this.ngxService.stop();
        console.error("Error retrieving items:", error); // Use console.error for errors
        this.allItemsSubject.next([]); // Handle the error state
      });
  }

  generateDGRefNo(count: number) {
    const month = this.today.getMonth() + 1; // Months are zero-based in JavaScript
    const day = this.today.getDate();
    const year = this.today.getFullYear();
    const suffix = "-" + count;

    // Ensure month and day are always two digits
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    this.DGRefNo = `${formattedDay}/${formattedMonth}/${year}${suffix}`;
    console.log("this.DGRefNo ", this.DGRefNo);
  }

  handleSubmit() {
    console.log("this.componentRequestForm.value", this.componentRequestForm.value);
    console.log("this.DGRefNo", this.DGRefNo);
    this.ngxService.start();
    this.componentRequestService.addListItem(this.componentRequestForm.value, this.DGRefNo)
      .then((listItem) => {
        this.componentRequestForm.reset();
        this.componentRequestForm.markAsUntouched();
        this.toastrService.success("Request submitted successfully.");
        this.router.navigate(['/component-request']);
        this.ngxService.stop();
      })
      .catch((error) => {
        console.log("Error adding item: ", error);
        this.toastrService.error("Something went wrong. Please try again later.");
        this.ngxService.stop();
      });

  }
  onComponentFilterFocus() {
    this.componentRequestForm?.get('componentCode')?.setValue(this.componentRequestForm?.get('componentCode')?.value || '');
  }

  onComponentSelected(event: any) {
    this.selectedComponent = event.option.value;
    console.log('Selected component:', this.selectedComponent);
    this.availableQuantity = this.selectedComponent.Quantity || 0;
    this.componentRequestForm.get('availableQuantity')?.setValue(this.availableQuantity);
    this.imageURL=this.selectedComponent.Image;
  }

  // displayFn(product: any): string {
  //   return product && product.Code ? product.Code : '';
  // }
  displayFn(product: any): string {
    return product && product.Code && product.ProductName ? `${product.ProductName} (${product.Code})` : '';
  }

  // private _filter(value: any): any[] {
  //   let filterValue: string = '';
  //   filterValue = value?.toLowerCase();
  //   return this.componentOptions.filter(option => option?.Code?.toLowerCase().includes(filterValue));
  // }
  private _filter(value: any): any[] {
    let filterValue: string = '';
    let filterComponentName: string = '';
    if (typeof (value) === 'string') {
      filterValue = value?.toLowerCase();
    } else {
      filterValue = value?.Code?.toLowerCase();
    }
    if (typeof (value) === 'string') {
      filterComponentName = value?.toLowerCase();
    } else {
      filterComponentName = value?.ProductName?.toLowerCase();
    }
    return this.componentOptions.filter(option => option?.Code?.toLowerCase().includes(filterValue) || option?.ProductName?.toLowerCase().includes(filterComponentName));
  }


  openDatepicker(datepicker: any) {
    datepicker.open();
  }

  getErrorMessage() {
    return "This field is required";
  }

  trackById(index: number, item: any): number {
    return item.ID; // Make sure item has ID
  }

}