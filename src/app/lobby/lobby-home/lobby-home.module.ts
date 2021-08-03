import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LobbyHomePageRoutingModule } from './lobby-home-routing.module';

import { LobbyHomePage } from './lobby-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LobbyHomePageRoutingModule
  ],
  declarations: [LobbyHomePage]
})
export class LobbyHomePageModule {}
