import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DashboardPageRoutingModule
  ],
  entryComponents: [UserPopoverComponent],
  declarations: [DashboardPage, UserPopoverComponent]
})
export class DashboardPageModule { }
