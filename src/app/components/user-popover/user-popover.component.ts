import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-user-popover',
  templateUrl: './user-popover.component.html',
  styleUrls: ['./user-popover.component.scss'],
})
export class UserPopoverComponent implements OnInit {
  ospite: boolean;

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private loginService: LoginService
  ) {
    this.getTipoUtente()
  }

  ngOnInit() { }

  async getTipoUtente() {
    const token = (await this.loginService.getToken()).value;
    const decoded_token: any = jwt_decode(token);
    if (decoded_token.tipo === 'OSPITE') this.ospite = true;
    else if (decoded_token.tipo === 'GIOCATORE') this.ospite = false;
  }

  openProfile() {
    this.popoverController.dismiss();
    this.router.navigateByUrl('/account', { replaceUrl: true });
  }

  logout() {
    this.loginService.logout();
    this.popoverController.dismiss();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  openRegistration() {

  }
}