import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EditGamePage } from '../modal-pages/edit-game/edit-game.page';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {
  // segment: string = "lista";
  games = [];
  data: FormGroup;
  attivo = true;
  mostraRegolamento = false;
  regolamento: string = "";

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService
  ) {
    // this.loadGames();
  }

  ngOnInit() {
    this.data = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      link: ['', Validators.required],
      minGiocatori: ['', Validators.required],
      maxGiocatori: ['', Validators.required]
    });
  }

  // segmentChanged(ev: any) {
  //   this.segment = ev.detail.value;
  // }

  /**
   * Pulisce il form di creazione gioco quando l'utente cambia segment nella pagina.
   */
  clearForm() {
    this.data.reset();
  }

  // /**
  //  * Effettua la chiamata REST per ottenere la lista dei giochi della piattaforma.
  //  */
  // async loadGames() {
  //   const tokenValue = (await this.loginService.getToken()).value;
  //   const headers = { 'token': tokenValue };

  //   this.http.get('/games/admin', { headers }).subscribe(
  //     async (res) => {
  //       this.games = res['results'];
  //       console.log(res['results']);
  //     },
  //     async (res) => {
  //       this.errorManager.stampaErrore(res, 'Impossibile caricare i giochi!');
  //     });
  // }

  // /**
  //  * Apre una pagina modale per editare il gioco selezionato dall'utente.
  //  * @param game Il gioco che si vuole modificare.
  //  * @returns La modal per l'editing.
  //  */
  // async editGame(game) {
  //   const modal = await this.modalController.create({
  //     component: EditGamePage,
  //     componentProps: {
  //       game: game
  //     },
  //     cssClass: 'fullscreen'
  //   });

  //   modal.onDidDismiss().then(() => {
  //     this.loadGames();
  //   });

  //   return await modal.present();
  // }

  /**
   * Dopo aver controllato i campi effettua la chiamata REST per creare il nuovo
   * gioco secondo i dati inseriti dall'utente.
   */
  async creaGioco() {
    if (this.controllaCampi()) {
      const loading = await this.loadingController.create();
      await loading.present();

      const tokenValue = (await this.loginService.getToken()).value;
      var toSend = this.data.value;
      toSend.config = { game: toSend.link };
      toSend.link = "/" + toSend.link;
      toSend.attivo = this.attivo;

      if (this.mostraRegolamento) toSend.regolamento = this.regolamento;
      else toSend.regolamento = null;

      toSend.token = tokenValue;

      this.http.post('/game/crea', toSend).subscribe(
        async (res) => {
          this.data.reset();
          this.alertCreator.createInfoAlert('Gioco creato', 'Il gioco è stato creato con successo.');
          // this.loadGames();
          // this.segment = "lista";
          await loading.dismiss();
        },
        async (res) => {
          this.data.reset();
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Creazione gioco fallita');
        });
    }
  }

  /**
   * Controlla che i valori inseriti dall'utente negli input siano corretti.
   * @returns true se i dati passati non contengono errori, false altrimenti.
   */
  controllaCampi() {
    if (this.data.value.minGiocatori < 1 || this.data.value.maxGiocatori < 1) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero dei giocatori non può essere negativo!');
      return false;
    }
    if (this.data.value.minGiocatori > this.data.value.maxGiocatori) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero minimo dei giocatori non può essere maggiore del numero massimo!');
      return false;
    }
    return true;
  }
}
