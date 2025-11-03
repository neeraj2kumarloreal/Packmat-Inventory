import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ListCatalogComponent } from './catalog/list-catalog/list-catalog.component';
import { StockInComponent } from './stock-in/stock-in/stock-in.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { AddItemComponent } from './catalog/add-item/add-item/add-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddForecastComponent } from './forecast/add-forecast/add-forecast.component';
import { ListForecastComponent } from './forecast/list-forecast/list-forecast.component';
import { ForecastComponent } from './forecast/forecast.component';
import { AdminForecastPageComponent } from './admin-forecast-page/admin-forecast-page.component';
import { AdminListForecastComponent } from './admin-forecast-page/admin-list-forecast/admin-list-forecast.component';
import { AdminViewForecastComponent } from './admin-forecast-page/admin-view-forecast/admin-view-forecast.component';
import { ViewEditItemComponent } from './catalog/view-edit-item/view-edit-item.component';


@NgModule({
  declarations: [
    ListCatalogComponent,
    ForecastComponent,
    StockInComponent,
    AddItemComponent,
    AddForecastComponent,
    ListForecastComponent,
    AdminForecastPageComponent,
    AdminListForecastComponent,
    AdminViewForecastComponent,
    ViewEditItemComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class InventoryModule { }
