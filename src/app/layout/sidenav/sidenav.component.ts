import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(300, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SidenavComponent {
  isSidebarVisible = true;
  isSubmenuOpen = false;
  isDashboardSelected = false;
  currentUserRole: any;


  constructor(private sidenavService: SidenavService, private commonService: CommonService) { }

  ngOnInit() {
    this.currentUserRole = localStorage.getItem("role");
    this.sidenavService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidebarVisible = isVisible;
    });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidenavService.toggleSidebar(); // Toggle sidebar state
  }


  toggleSubmenu() {
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }


  selectDashboard() {
    this.isDashboardSelected = true;
  }

  checkAccess(option: string) {
    return this.commonService.hasAccess(option);
  }

  // hasAccess(item: string) {
  //   if (this.currentUserRole === 'R&I Admin' || this.currentUserRole === 'Pune DG Admin' || this.currentUserRole === 'Transport Admin') {
  //     return true;
  //   }
  //   switch (item) {
  //     case 'Forecast':
  //     case 'Forecast Overview':
  //       return this.currentUserRole === 'Lab User'
  //     case 'Component Request':
  //       return this.currentUserRole === 'Formulator' || this.currentUserRole === 'Lab User'
  //     default:
  //       return false;
  //   }
  // }
}
