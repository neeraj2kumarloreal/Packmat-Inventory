import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCatalogComponent } from './inventory/catalog/list-catalog/list-catalog.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: ListCatalogComponent
  },
  {
    path: '',
    loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule),
  },
  {
    path: '**',
    component: ListCatalogComponent
  
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
