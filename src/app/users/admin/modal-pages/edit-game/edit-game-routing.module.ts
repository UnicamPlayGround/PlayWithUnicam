import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditGamePage } from './edit-game.page';

const routes: Routes = [
  {
    path: '',
    component: EditGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditGamePageRoutingModule {}
