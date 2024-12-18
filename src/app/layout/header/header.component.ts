import { Component } from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(private sidenavService: SidenavService) { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    // Check if the button click event is registered
    this.sidenavService.toggleSidebar();
    // Check if the visibility state is changing
  }

}
