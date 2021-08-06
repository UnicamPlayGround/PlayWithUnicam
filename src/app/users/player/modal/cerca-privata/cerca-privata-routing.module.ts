import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CercaPrivataPage } from './cerca-privata.page';

const routes: Routes = [
  {
    path: '',
    component: CercaPrivataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CercaPrivataPageRoutingModule {}
