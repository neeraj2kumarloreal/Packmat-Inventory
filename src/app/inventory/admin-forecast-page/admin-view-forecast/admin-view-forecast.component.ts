import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ForecastService } from 'src/app/services/forecast.service';

@Component({
  selector: 'app-admin-view-forecast',
  templateUrl: './admin-view-forecast.component.html',
  styleUrls: ['./admin-view-forecast.component.scss'],
  providers:[DatePipe]
})
export class AdminViewForecastComponent implements OnInit {

  forecastDetails: any;
  forecastForm: FormGroup;
  imageURL: string = '';
  displayedColumns: string[] = ['name', 'forecastQuantity', 'created',];
  dataSource:any=[];

  constructor(private formBuilder: FormBuilder, private forecastService: ForecastService, private ngxService: NgxUiLoaderService,private commonService:CommonService,private toastrService: ToastrService,private router: Router) {
    this.forecastForm = this.formBuilder.group({
      pmCode: ['', [Validators.required]],
      name: ['', [Validators.required]],
      imageUrl: ['', [Validators.required]],
      forecastQuantity: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.commonService.hasAccess('Forecast Overview')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    this.fetchData();
  }

  fetchData() {
    let obj = localStorage.getItem("forecastData");
    this.forecastDetails = obj ? JSON.parse(obj) : null; // Or provide a default value
    console.log("forecastDetails", this.forecastDetails);
    this.forecastForm.get('pmCode')?.setValue(this.forecastDetails?.code);
    this.forecastForm.get('name')?.setValue(this.forecastDetails?.name);
    this.forecastForm.get('forecastQuantity')?.setValue(this.forecastDetails?.forecastQuantity);
    this.imageURL = this.forecastDetails?.image;
    this.fetchForecastList();
  }

  fetchForecastList() {
    this.ngxService.start();
    this.forecastService.getItemsByCodeAndYear(this.forecastDetails.code, new Date().getFullYear()).then((items) => {
      console.log("items", items);
      if (items != undefined || items != null) {
        const allItems = items.map((item) => ({
          ID: item.ID,
          productName: item.ProductName,
          code: item.Title,
          forecastQuantity: item.ForecastQuantity,
          // imageURL: item?.ProductImageURL[0],
          imageURL: `item?.ProductImageURL[0]?t=${new Date().getTime()}`,
          createdDate: item.Created,
          // createdBy:item.Author
          createdBy: Object.values(item.Author).at(1)
        }))
        console.log("allItems", allItems);
        this.dataSource = new MatTableDataSource(allItems);
        this.ngxService.stop();
      }

    })
      .catch((error) => {
        this.ngxService.stop();
        console.log("Error retrieving items: ", error);
      });
  }

}
