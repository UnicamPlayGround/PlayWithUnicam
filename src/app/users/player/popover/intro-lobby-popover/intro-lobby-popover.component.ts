import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { CercaPrivataPage } from '../../modal/cerca-privata/cerca-privata.page';
import { CreaLobbyPage } from '../../modal/crea-lobby/crea-lobby.page';
import { CercaPubblicaPage } from '../../modal/cerca-pubblica/cerca-pubblica.page';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EditGamePage } from 'src/app/users/admin/modal-pages/edit-game/edit-game.page';

@Component({
  selector: 'app-intro-lobby-popover',
  templateUrl: './intro-lobby-popover.component.html',
  styleUrls: ['./intro-lobby-popover.component.scss'],
})
export class IntroLobbyPopoverComponent implements OnInit {
  @Input() giocoSelezionato;
  tipoUtente: string;

  constructor(
    private popoverController: PopoverController,
    private loginService: LoginService,
    private modalController: ModalController
  ) {
    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente)
          this.tipoUtente = tipoUtente;
      }
    );
  }

  ngOnInit() { }

  closePopover() {
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
      },
      cssClass: 'create-lobby'
    });
    this.closePopover();
    return await modal.present();
  }

  /**
   * Apre una modal per partecipare ad una lobby private.
   */
  async cercaLobbyPrivata() {
    const modal = await this.modalController.create({
      component: CercaPrivataPage,
      cssClass: 'create-lobby'
    });
    this.closePopover();
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
    this.closePopover();
    return await modal.present();
  }

  /**
 * Apre una pagina modale per editare il gioco selezionato dall'utente.
 * @param game Il gioco che si vuole modificare.
 * @returns La modal per l'editing.
 */
  async editGame() {
    const modal = await this.modalController.create({
      component: EditGamePage,
      componentProps: {
        game: this.giocoSelezionato
      },
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const modified = data['data'];

      if (modified) {
        this.popoverController.dismiss(true);
      } else this.closePopover();
    });

    return await modal.present();
  }
}