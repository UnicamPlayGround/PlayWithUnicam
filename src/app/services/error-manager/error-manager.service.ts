import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ErrorManagerService {

  constructor(private alertController: AlertController, private router: Router) { }

  stampaErrore(res, headerText) {
    if (this.controllaRes(res)) this.stampa(headerText, res.error)
  }

  private controllaRes(res) {
    if (res.error == 'JWT non valido!') {
      this.stampa('Errore nella Sessione', 'Rieffettua il Login');
      this.router.navigateByUrl('/login', { replaceUrl: true });
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
