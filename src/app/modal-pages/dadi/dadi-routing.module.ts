import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DadiPage } from './dadi.page';

const routes: Routes = [
  {
    path: '',
    component: DadiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DadiPageRoutingModule {}
