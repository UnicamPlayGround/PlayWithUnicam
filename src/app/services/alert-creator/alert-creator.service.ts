import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertCreatorService {

  constructor(private alertController: AlertController) { }

  //TODO commentare
  async createConfirmationAlert(messaggio, cb) {
    var buttons = [
      { text: 'ANNULLA', role: 'cancel' },
      { text: 'OK', handler: () => { cb(); } }
    ]
    this.createAlert("Conferma", messaggio, buttons);
  }

  async createAlert(header, messaggio, buttons) {
    const alert = await this.alertController.create({
      header: header,
      message: messaggio,
      buttons: buttons
    });
    await alert.present();
  }

  async createInfoAlert(header, messaggio) {
    this.createAlert(header, messaggio, ['OK']);
  }
}
