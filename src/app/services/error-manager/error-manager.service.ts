import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginService } from '../login-service/login.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorManagerService {

  constructor(
    private alertController: AlertController,
    private router: Router,
    private loginService: LoginService
  ) { }

  stampaErrore(res, headerText) {
    if (this.controllaRes(res)) this.stampa(headerText, res.error)
  }

  private controllaRes(res) {
    if (res.error == 'Errore, JWT non valido! Rieffettua il Login.') {
      this.stampa('Errore nella Sessione', 'Rieffettua il Login');
      this.loginService.logout();
      this.router.navigateByUrl('/home', { replaceUrl: true });
      return false;
    } else return true;
  }

  private async stampa(headerText, messageText) {
    const alert = await this.alertController.create({
      header: headerText,
      message: messageText,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
