import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  currentUserName: any;
  role: any;
  @Input() title: string = '';

  constructor(private sidenavService: SidenavService, private router: Router, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.currentUserName = localStorage.getItem("currentUserName")
    this.role = localStorage.getItem("role");
  }

  toggleSidebar() {
    // Check if the button click event is registered
    this.sidenavService.toggleSidebar();
    // Check if the visibility state is changing
  }

  goHome() {
    window.location.hash = '#/home';
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
