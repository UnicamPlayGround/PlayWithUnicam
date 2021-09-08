import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DadiPageRoutingModule } from './dadi-routing.module';

import { DadiPage } from './dadi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DadiPageRoutingModule
  ],
  declarations: [DadiPage]
})
export class DadiPageModule {}
