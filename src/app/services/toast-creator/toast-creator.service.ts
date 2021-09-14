import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastCreatorService {

  constructor(private toastController: ToastController) { }

  /**
   * Crea un toast con il messaggio in input.
   * @param messaggio Messaggio da mostrare
   * @param posizione Posizione del toast *(top, bottom, middle)*
   * @param durata Durata del toast
   */
  async creaToast(messaggio, posizione, durata) {
    const toast = await this.toastController.create({
      message: messaggio,
      position: posizione,
      cssClass: 'toast',
      duration: durata
    });
    await toast.present();
  }

}