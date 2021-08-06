import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LobbyGuestPage } from './lobby-guest.page';

const routes: Routes = [
  {
    path: '',
    component: LobbyGuestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LobbyGuestPageRoutingModule {}
