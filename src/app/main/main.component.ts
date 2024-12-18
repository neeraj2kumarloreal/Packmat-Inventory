import { Component } from '@angular/core';
import { SidenavService } from '../services/sidenav/sidenav.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  isSidenavVisible = true;
  constructor(private sidenavService: SidenavService) {}


  ngOnInit() {
    this.sidenavService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidenavVisible = isVisible;
    });
  }
}
