import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { IntroLobbyComponentModule } from '../popover/intro-lobby-popover/intro-lobby-popover.module';
import { UserPopoverComponentModule } from 'src/app/components/user-popover/user-popover.module';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardPageRoutingModule,
    IntroLobbyComponentModule,
    UserPopoverComponentModule,
    SwiperModule
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule { }
