import { Component } from '@angular/core';
import { SidenavService } from '../services/sidenav/sidenav.service';
import { InventoryService } from '../services/inventory/inventory.service';
import { CommonService } from '../services/common/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  isSidenavVisible = true;
  isDataLoaded: boolean = true;
  constructor(private sidenavService: SidenavService, private commonService: CommonService, private toastrService: ToastrService,) {
    // console.log("this.isDataLoaded",this.isDataLoaded)
    // this.commonService.setCurrentUserData().then((res) => {
    //   // this.toastrService.success("Forecast submitted successfully.");
    //   this.isDataLoaded = true;
    //   console.log("this.isDataLoaded",this.isDataLoaded)
    // }).catch((error) => {
    //   console.log("Error adding item: ", error);
    //   this.isDataLoaded =false;
    //   this.toastrService.error("Something went wrong. Please try again later.");
    // });
  }
  
  ngOnInit() {
    this.sidenavService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidenavVisible = isVisible;
    });
  }
}
