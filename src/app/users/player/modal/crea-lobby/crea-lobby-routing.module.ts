import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreaLobbyPage } from './crea-lobby.page';

const routes: Routes = [
  {
    path: '',
    component: CreaLobbyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreaLobbyPageRoutingModule {}
