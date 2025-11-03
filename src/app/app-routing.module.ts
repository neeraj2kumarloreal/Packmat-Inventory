// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { ListCatalogComponent } from './inventory/catalog/list-catalog/list-catalog.component';
// import { LocationStrategy, HashLocationStrategy } from '@angular/common';

// const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'catalog',
//     pathMatch: 'full'
//   },
//   {
//     path: '',
//     loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule),
//   },
//   {
//     path: '',
//     loadChildren: () => import('./request/request.module').then(m => m.RequestModule),
//   },
//   {
//     path: '',
//     loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
//   },
//   {
//     path: '',
//     loadChildren: () => import('./gatepass/gatepass.module').then(m => m.GatepassModule),
//   },
//   {
//     path: '**',
//     component: ListCatalogComponent
//   }
// ];


// @NgModule({
//   imports: [RouterModule.forRoot(routes, { useHash: true })],
//   providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

const routes: Routes = [
  // { path: '', component: HomeComponent },
  // { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'packmat',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      {
        path: '',
        loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule)
      },
      { path: 'request', loadChildren: () => import('./request/request.module').then(m => m.RequestModule) },
      { path: 'report', loadChildren: () => import('./report/report.module').then(m => m.ReportModule) }
    ]
  },
  {
    path: 'gatepass',
    loadChildren: () => import('./gatepass/gatepass.module').then(m => m.GatepassModule),
  },
  {
    path: 'qio',
    loadChildren: () => import('./qio/qio.module').then(m => m.QIOModule),
  },

  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  exports: [RouterModule]
})
export class AppRoutingModule { }