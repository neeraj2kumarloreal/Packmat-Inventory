import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ListCatalogComponent } from './catalog/list-catalog/list-catalog.component';
import { ForecastComponent } from './forecast/forecast/forecast.component';
import { StockInComponent } from './stock-in/stock-in/stock-in.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';



@NgModule({
  declarations: [
    ListCatalogComponent,
    ForecastComponent,
    StockInComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    AngularMaterialModule
  ]
})
export class InventoryModule { }
