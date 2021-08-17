import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LobbyAdminPageRoutingModule } from './lobby-admin-routing.module';

import { LobbyAdminPage } from './lobby-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LobbyAdminPageRoutingModule
  ],
  declarations: [LobbyAdminPage]
})
export class LobbyAdminPageModule {}
