import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { CercaPrivataPage } from '../../modal/cerca-privata/cerca-privata.page';
//TODO forse da importare sul module di dashboard
import { CreaLobbyPage } from '../../modal/crea-lobby/crea-lobby.page';

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

  async creaLobby() {
    console.log(this.giocoSelezionato);
    const modal = await this.modalController.create({
      component: CreaLobbyPage,
      componentProps: {
        giocoSelezionato: this.giocoSelezionato
      }
    });

    return await modal.present();
  }

  async cercaLobbyPrivata() {
    const modal = await this.modalController.create({
      component: CercaPrivataPage
    });

    return await modal.present();
  }
}