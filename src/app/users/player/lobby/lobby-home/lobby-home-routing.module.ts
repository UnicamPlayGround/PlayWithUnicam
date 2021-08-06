import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LobbyHomePage } from './lobby-home.page';

const routes: Routes = [
  {
    path: '',
    component: LobbyHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LobbyHomePageRoutingModule {}
