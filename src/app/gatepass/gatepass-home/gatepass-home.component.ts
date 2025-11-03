import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common/common.service';
type TabType = 'my-requests' | 'requests-for-review' | 'approval' | 'all-requests';
@Component({
  selector: 'app-gatepass-home',
  templateUrl: './gatepass-home.component.html',
  styleUrls: ['./gatepass-home.component.scss']
})
export class GatepassHomeComponent {
  activeTab: TabType = 'my-requests';
  role: string | null | undefined;

  constructor(private cdr: ChangeDetectorRef, private commonService: CommonService, private toastrService: ToastrService,private router:Router) {
    // this.commonService.setCurrentUserData().then((res) => {
    //   // this.toastrService.success("Forecast submitted successfully.");
    // }).catch((error) => {
    //   console.log("Error adding item: ", error);
    //   this.toastrService.error("Something went wrong. Please try again later.");
    // });
  }
  ngOnInit(): void {
    const allowedRoles = [
      'Pune DG Admin',
      'Transport Admin',
      'Gatepass Admin',
      'Gatepass User'
    ];
  
    this.role = localStorage.getItem("role");
  
    if (!this.role || !allowedRoles.includes(this.role)) {
      this.toastrService.error("You are not authorized to access this page");
      this.router.navigate(['/home']);
      return;
    }
    // Authorized: continue with other logic if needed
  }
  // setActiveTab(tab: TabType) {
  //   this.activeTab = tab;
  // }
  setActiveTab(tab: TabType) {
    console.log('Tab clicked:', tab);
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  shouldShowRequestsforReviewTab() {
    this.role = localStorage.getItem("role");
    return this.role === 'Gatepass Admin' || this.role === 'Transport Admin';
  }

  shouldShowApprovalTab() {
    this.role = localStorage.getItem("role");
    return this.role === 'Pune DG Admin';
  }

  shouldShowAllRequestTab() {
    this.role = localStorage.getItem("role");
    return this.role === 'Pune DG Admin' || this.role === 'Gatepass Admin';
  }
}
