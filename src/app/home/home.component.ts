import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../services/common/common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  currentUserName: string | null | undefined;
  role: string | null | undefined;
  isDataLoaded: boolean = false;
  constructor(private router: Router, private commonService: CommonService, private toastrService: ToastrService,
  ) {
    console.log("this.isDataLoaded", this.isDataLoaded)
    this.commonService.setCurrentUserData().then((res) => {
      // this.toastrService.success("Forecast submitted successfully.");
      this.isDataLoaded = true;
      console.log("this.isDataLoaded", this.isDataLoaded)
    }).catch((error) => {
      console.log("Error adding item: ", error);
      this.isDataLoaded = false;
      this.toastrService.error("Something went wrong. Please try again later.");
    });
  }

  ngOnInit(): void {
    this.currentUserName = localStorage.getItem("currentUserName");
    this.role = localStorage.getItem("role");
  }

  handlePackmatClick() {
    this.currentUserName = localStorage.getItem("currentUserName");
    this.role = localStorage.getItem("role");
    if (this.role === 'Gatepass Admin' || this.role === 'Gatepass User') {
      this.toastrService.error("You are not authorized to access this page");
      // this.router.navigate(['/']);
      return;
    }
    this.router.navigate(['/packmat']);
  }
  handleGatepassClick() {
    this.currentUserName = localStorage.getItem("currentUserName");
    this.role = localStorage.getItem("role");
    if (this.role === 'Pune DG Admin' || this.role === 'Transport Admin' || this.role === 'Gatepass Admin' || this.role === 'Gatepass User') {
      this.router.navigate(['/gatepass']);
    } else {
      this.toastrService.error("You are not authorized to access this page");
    }
  }
  handleQualityImprovementOpportunityClick() {
    this.router.navigate(['/qio']);
  }

  getInitials(): string {
    if (!this.currentUserName) return '';
  
    // Split the currentUserName by space
    const parts = this.currentUserName.trim().split(' ');
  
    // If there are at least two parts
    if (parts.length >= 2) {
      // First letter of first currentUserName (second part)
      const firstInitial = parts[1][0].toUpperCase();
      // First letter of last currentUserName (first part)
      const lastInitial = parts[0][0].toUpperCase();
      return `${firstInitial} ${lastInitial}`;
    }
  
    // If only one part, just return its initial twice
    return `${parts[0][0].toUpperCase()} ${parts[0][0].toUpperCase()}`;
  }
}
