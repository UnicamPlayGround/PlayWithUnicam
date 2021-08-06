import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CercaPrivataPageRoutingModule } from './cerca-privata-routing.module';

import { CercaPrivataPage } from './cerca-privata.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CercaPrivataPageRoutingModule
  ],
  declarations: [CercaPrivataPage]
})
export class CercaPrivataPageModule {}
