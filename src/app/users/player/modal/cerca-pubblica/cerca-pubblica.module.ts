import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CercaPubblicaPageRoutingModule } from './cerca-pubblica-routing.module';

import { CercaPubblicaPage } from './cerca-pubblica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CercaPubblicaPageRoutingModule
  ],
  declarations: [CercaPubblicaPage]
})
export class CercaPubblicaPageModule {}
