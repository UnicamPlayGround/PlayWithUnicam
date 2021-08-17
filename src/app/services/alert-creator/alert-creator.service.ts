import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertCreatorService {

  constructor(private alertController: AlertController) { }

  async createConfirmationAlert(messaggio, cb) {
    const alert = await this.alertController.create({
      header: 'Conferma',
      message: messaggio,
      buttons: [
        {
          text: 'ANNULLA',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: () => {
            cb();
          }
        }
      ]
    });
    await alert.present();
  }

  async createInfoAlert(header, messaggio){
    const alert = await this.alertController.create({
      header: header,
      message: messaggio,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
