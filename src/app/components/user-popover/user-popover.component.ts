import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import jwt_decode from 'jwt-decode';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';

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
    private loginService: LoginService,
    private alertCreator: AlertCreatorService
  ) {
    this.getTipoUtente()
  }

  ngOnInit() { }

  async getTipoUtente() {
    const token = (await this.loginService.getToken()).value;
    const decodedToken: any = jwt_decode(token);
    if (decodedToken.tipo === 'OSPITE') this.ospite = true;
    else if (decodedToken.tipo === 'GIOCATORE') this.ospite = false;
  }

  openProfile() {
    this.popoverController.dismiss();
    this.router.navigateByUrl('/account', { replaceUrl: true });
  }

  logout() {
    var message = "Sei sicuro di voler effettuare il logout?";
    this.alertCreator.createConfirmationAlert(message, () => {
      this.loginService.logout();
      this.popoverController.dismiss();
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  openRegistration() {
    this.popoverController.dismiss();
    this.router.navigateByUrl('/registration', { replaceUrl: true });
  }
}