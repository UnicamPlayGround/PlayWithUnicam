import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CercaPrivataPageRoutingModule } from './cerca-privata-routing.module';

import { CercaPrivataPage } from './cerca-privata.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CercaPrivataPageRoutingModule
  ],
  declarations: [CercaPrivataPage]
})
export class CercaPrivataPageModule {}
