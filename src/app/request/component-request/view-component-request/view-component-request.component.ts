import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/common/common.service';
import { ComponentRequestHistoryService } from 'src/app/services/component-request-history/component-request-history.service';
import { ForecastService } from 'src/app/services/forecast.service';

@Component({
  selector: 'app-view-component-request',
  templateUrl: './view-component-request.component.html',
  styleUrls: ['./view-component-request.component.scss']
})
export class ViewComponentRequestComponent implements OnInit, AfterViewInit {

  requestDetails: any;
  componentRequestForm: FormGroup;
  imageURL: string = '';
  displayedColumns: string[] = ['processedBy', 'processedDate', 'outcome', 'remark',];
  dataSource: any = [];

  constructor(private formBuilder: FormBuilder, private forecastService: ForecastService, private ngxService: NgxUiLoaderService,
    private componentRequestHistoryService: ComponentRequestHistoryService, private toastrService: ToastrService, private router: Router, private commonService: CommonService) {
    this.componentRequestForm = this.formBuilder.group({
      code: [''],
      name: [''],
      requestedQuantity: [''],
      requiredDate: [''],
      purpose: [''],
      metierAndProjectName: [''],
      application: [''],
      isReqPartOfYearlyForecast: [''],
      requestDate: [''],
      dgReferenceNumber: [''],
      requestedBy: [''],
    });
  }
  ngOnInit(): void {
    if (!this.commonService.hasAccess('Component Request')) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/']);
    }
    let obj = localStorage.getItem("data");
    this.requestDetails = obj ? JSON.parse(obj) : null;
    console.log("this.requestDetails",this.requestDetails);
    // this.imageURL = this.requestDetails?.image?.$5_1;
    const image = Object.values(this.requestDetails?.image)[0];
    console.log("this.image",image);

    // this.imageURL = this.requestDetails?.image?.$5_1 + `?t=${new Date().getTime()}`;
    this.imageURL = image as string;
    
    this.fetchCommentList();
  }

  ngAfterViewInit(): void {
    this.componentRequestForm.patchValue(this.requestDetails);
  }


  fetchCommentList() {
    this.ngxService.start();
    this.componentRequestHistoryService.getItemByComponentRequestID(this.requestDetails.id).then((items) => {
      if (items != undefined || items != null) {
        const allItems = items.map((item) => ({
          ID: item.ID,
          // processedBy: item.Author,
          processedBy: Object.values(item?.Author).at(1),
          processedDate: item.Created,
          outcome: item.Outcome,
          remark: item.Remark
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
