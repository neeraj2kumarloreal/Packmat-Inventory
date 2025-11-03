import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCatalogComponent } from './catalog/list-catalog/list-catalog.component';
import { StockInComponent } from './stock-in/stock-in/stock-in.component';
import { ListForecastComponent } from './forecast/list-forecast/list-forecast.component';
import { ForecastComponent } from './forecast/forecast.component';
import { AddForecastComponent } from './forecast/add-forecast/add-forecast.component';
import { AdminForecastPageComponent } from './admin-forecast-page/admin-forecast-page.component';
import { AdminListForecastComponent } from './admin-forecast-page/admin-list-forecast/admin-list-forecast.component';
import { AdminViewForecastComponent } from './admin-forecast-page/admin-view-forecast/admin-view-forecast.component';


const routes: Routes = [
  { path: 'catalog', component: ListCatalogComponent },         // /packmat/catalog
  {
    path: 'forecast', component: ForecastComponent, children: [
      { path: '', component: ListForecastComponent },           // /packmat/forecast
      { path: 'add', component: AddForecastComponent },         // /packmat/forecast/add
    ]
  },
  {
    path: 'forecast-overview', component: AdminForecastPageComponent, children: [
      { path: '', component: AdminListForecastComponent },      // /packmat/forecast-overview
      { path: 'view', component: AdminViewForecastComponent },  // /packmat/forecast-overview/view
    ]
  },
  { path: 'stock-in', component: StockInComponent },            // /packmat/stock-in
  { path: '', redirectTo: 'catalog', pathMatch: 'full' }        // redirect /packmat to /packmat/catalog
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
