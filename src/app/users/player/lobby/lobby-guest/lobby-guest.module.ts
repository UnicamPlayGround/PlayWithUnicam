import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LobbyGuestPageRoutingModule } from './lobby-guest-routing.module';

import { LobbyGuestPage } from './lobby-guest.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LobbyGuestPageRoutingModule
  ],
  declarations: [LobbyGuestPage]
})
export class LobbyGuestPageModule {}
