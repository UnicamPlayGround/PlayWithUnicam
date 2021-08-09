import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CercaPubblicaPage } from './cerca-pubblica.page';

const routes: Routes = [
  {
    path: '',
    component: CercaPubblicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CercaPubblicaPageRoutingModule {}
