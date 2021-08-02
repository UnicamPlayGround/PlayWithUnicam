import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
})
export class UserPopoverComponent implements OnInit {

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  logout() {
    this.loginService.logout();
    this.popoverController.dismiss();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
