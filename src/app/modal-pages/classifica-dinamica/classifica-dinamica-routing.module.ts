import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClassificaDinamicaPage } from './classifica-dinamica.page';

const routes: Routes = [
  {
    path: '',
    component: ClassificaDinamicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassificaDinamicaPageRoutingModule {}
