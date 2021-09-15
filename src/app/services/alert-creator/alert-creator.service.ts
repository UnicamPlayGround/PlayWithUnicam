import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertCreatorService {

  constructor(private alertController: AlertController) { }

  /**
   * Creare un alert di conferma.
   * All'interno di esso, oltre al messaggio passato in input, saranno mostrati anche
   * i due pulsanti:
   * * 'ANNULLA': per annullare l'operazione
   * * 'OK': per confermare l'operazione.
   * @param messaggio messaggio mostrato nell'alert
   * @param cb callback
   */
  async createConfirmationAlert(messaggio, cb) {
    var buttons = [
      { text: 'ANNULLA', role: 'cancel' },
      { text: 'OK', handler: () => { cb(); } }
    ]
    this.createAlert("Conferma", messaggio, buttons);
  }

  /**
   * Crea un alert personalizzato in base ai parametri passati in input e lo mostra.
   * @param header header dell'alert da mostrare.
   * @param messaggio messaggio dell'alert
   * @param buttons bottoni dell'alert
   */
  async createAlert(header, messaggio, buttons) {
    const alert = await this.alertController.create({
      header: header,
      message: messaggio,
      buttons: buttons
    });
    await alert.present();
  }

  /**
   * Crea un alert contenente un'informazione. 
   * Esso conterrà oltre all'header e al messaggio, il pulsante 'OK'.
   * @param header header dell'alert
   * @param messaggio messaggio dell'alert
   */
  async createInfoAlert(header, messaggio) {
    this.createAlert(header, messaggio, ['OK']);
  }
}
