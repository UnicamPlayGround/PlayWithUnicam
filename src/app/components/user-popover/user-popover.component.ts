import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
})
export class UserPopoverComponent implements OnInit {

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }
}
