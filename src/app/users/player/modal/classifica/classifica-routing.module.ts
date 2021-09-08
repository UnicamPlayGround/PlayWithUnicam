import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassificaPage } from './classifica.page';

const routes: Routes = [
  {
    path: '',
    component: ClassificaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassificaPageRoutingModule {}
