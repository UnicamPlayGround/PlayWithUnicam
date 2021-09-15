import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { CercaPrivataPage } from '../../modal/cerca-privata/cerca-privata.page';
import { CreaLobbyPage } from '../../modal/crea-lobby/crea-lobby.page';
import { CercaPubblicaPage } from '../../modal/cerca-pubblica/cerca-pubblica.page';

@Component({
  selector: 'app-intro-lobby-popover',
  templateUrl: './intro-lobby-popover.component.html',
  styleUrls: ['./intro-lobby-popover.component.scss'],
})
export class IntroLobbyPopoverComponent implements OnInit {
  @Input() giocoSelezionato;

  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  close() {
    this.popoverController.dismiss();
  }

  /**
   * Apre una modal per creare una lobby.
   */
  async creaLobby() {
    const modal = await this.modalController.create({
      component: CreaLobbyPage,
      componentProps: {
        giocoSelezionato: this.giocoSelezionato
      }
    });
    this.close();
    return await modal.present();
  }

  /**
   * Apre una modal per partecipare ad una lobby private.
   */
  async cercaLobbyPrivata() {
    const modal = await this.modalController.create({
      component: CercaPrivataPage
    });
    this.close();
    return await modal.present();
  }

  /**
   * Apre una modal per visualizzare le lobby pubbliche.
   */
  async cercaLobbyPubblica() {
    const modal = await this.modalController.create({
      component: CercaPubblicaPage,
      cssClass: 'lobby-pubbliche'
    });
    this.close();
    return await modal.present();
  }
}