import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LobbyAdminPage } from './lobby-admin.page';

const routes: Routes = [
  {
    path: '',
    component: LobbyAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LobbyAdminPageRoutingModule {}
