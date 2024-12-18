import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCatalogComponent } from './catalog/list-catalog/list-catalog.component';
import { ForecastComponent } from './forecast/forecast/forecast.component';
import { StockInComponent } from './stock-in/stock-in/stock-in.component';

const routes: Routes = [
  { path: 'catalog', component: ListCatalogComponent },
  { path: 'forecast', component: ForecastComponent },
  { path: 'stock-in', component: StockInComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
