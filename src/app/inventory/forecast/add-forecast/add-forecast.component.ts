import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, BehaviorSubject, startWith, map, of } from 'rxjs';
import { ForecastService } from 'src/app/services/forecast.service';
import { InventoryService } from 'src/app/services/inventory/inventory.service';

@Component({
  selector: 'app-add-forecast',
  templateUrl: './add-forecast.component.html',
  styleUrls: ['./add-forecast.component.scss']
})
export class AddForecastComponent {

  productOptions: any[] = [];
  productFilteredOptions: Observable<any[]>;
  forecastForm: FormGroup;

  private allItemsSubject = new BehaviorSubject<any[]>([]);

  baseUrl: string = "https://loreal.sharepoint.com";
  selectedProduct: any;
  selectedProductImageUrl: string = '';

  constructor(private inventoryService: InventoryService, private ngxService: NgxUiLoaderService, private formBuilder: FormBuilder, private forecastService: ForecastService, private toastrService: ToastrService) {
    this.productFilteredOptions = this.allItemsSubject.asObservable(); // Create observable
    this.forecastForm = this.formBuilder.group({
      pmCode: ['', [Validators.required]],
      name: ['', [Validators.required]],
      imageUrl: ['', [Validators.required]],
      availableQuantity: ['', [Validators.required]],
      forecastQuantity: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.fetchItemList();
    this.productFilteredOptions = this.forecastForm.get('pmCode')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    ) ?? of([]); // Provide a default empty observable
  }

  fetchItemList() {
    this.ngxService.start();
    this.inventoryService.getAllItems()
      .then((items: any[]) => {  // Type the items parameter
        if (items) { // Simplified check
          this.productOptions = items.map((item) => ({
            ID: item.ID,
            ProductName: item.ProductName,
            Code: item.PMCode,
            Quantity: item.AvailableQuantity,
            // Image: this.baseUrl + item.FileRef
            Image:`${this.baseUrl + item.FileRef}?t=${new Date().getTime()}`,

          }));
          this.allItemsSubject.next(this.productOptions); // Update the BehaviorSubject
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

  handleSubmit() {
    this.ngxService.start();
    this.forecastService.addListItem(this.forecastForm.value)
      .then((listItem) => {
        this.forecastForm.reset();
        this.forecastForm.markAsUntouched();
        this.selectedProductImageUrl="";
        this.toastrService.success("Forecast submitted successfully.");
        this.ngxService.stop();
      })
      .catch((error) => {
        console.log("Error adding item: ", error);
        this.toastrService.error("Something went wrong. Please try again later.");
        this.ngxService.stop();
      });

  }
  private _filter(value: any): any[] {
    let filterValue: string = '';
    if (typeof (value) === 'string') {
      filterValue = value?.toLowerCase();
    } else {
      filterValue = value?.Code?.toLowerCase();
    }
    return this.productOptions.filter(option => option?.Code?.toLowerCase().includes(filterValue));
  }

  onProductFilterFocus() {
    this.forecastForm.get('pmCode')?.setValue(this.forecastForm.get('pmCode')?.value || '');
  }

  onProductSelected(event: any) {
    this.selectedProduct = event.option.value;
    console.log('Selected product:', this.selectedProduct);
    this.forecastForm.get('name')?.setValue(this.selectedProduct.ProductName);
    this.forecastForm.get('availableQuantity')?.setValue(this.selectedProduct.Quantity || 0);
    this.selectedProductImageUrl = this.selectedProduct.Image;
    this.forecastForm.get('imageUrl')?.setValue(this.selectedProductImageUrl);
  }

  displayFn(product: any): string {
    return product && product.Code ? product.Code : '';
  }

  trackById(index: number, item: any): number {
    return item.ID; // Make sure item has ID
  }

  getErrorMessage() {
    return "This field is required";
  }
}
