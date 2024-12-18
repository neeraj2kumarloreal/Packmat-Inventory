import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxUiLoaderConfig, NgxUiLoaderModule, SPINNER } from 'ngx-ui-loader';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MainComponent } from './main/main.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { HeaderComponent } from './layout/header/header.component';
import { ExactActiveRouterLinkDirective } from './main/exact-active-router-link.directive';
import { ToastrModule } from 'ngx-toastr';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  text: "Loading...",
  textColor: "#FFFFFF",
  textPosition: "center-center",
  bgsColor: "#FFFFFF",
  fgsColor: "#FFFFFF",
  fgsType: SPINNER.squareJellyBox, // foreground spinner type
  fgsSize: 100,
  hasProgressBar:false
};
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SidenavComponent,
    HeaderComponent,
    ExactActiveRouterLinkDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton:true,
      maxOpened:5,
      progressBar:true
    })
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
