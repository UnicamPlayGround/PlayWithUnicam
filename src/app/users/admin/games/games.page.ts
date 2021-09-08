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
  segment: string = "lista";
  games = [];
  data: FormGroup;
  attivo = true;
  mostraConfig = false;
  config: string = "";
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
    this.loadGames();
  }

  //TODO finire commenti

  ngOnInit() {
    this.data = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      link: ['', Validators.required],
      minGiocatori: ['', Validators.required],
      maxGiocatori: ['', Validators.required]
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  clearForm() {
    this.data.reset();
  }

  async loadGames() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/games/admin', { headers }).subscribe(
      async (res) => {
        this.games = res['results'];
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giochi!');
      });
  }

  async editGame(game) {
    const modal = await this.modalController.create({
      component: EditGamePage,
      componentProps: {
        game: game
      },
      cssClass: 'edit-game'
    });

    modal.onDidDismiss().then((data) => {
      const giocoModificato = data['data'];

      if (giocoModificato)
        this.loadGames();
    });

    return await modal.present();
  }

  async creaGioco() {
    if (this.controllaCampi()) {
      const loading = await this.loadingController.create();
      await loading.present();

      const tokenValue = (await this.loginService.getToken()).value;
      var toSend = this.data.value;
      toSend.attivo = this.attivo;

      if (this.mostraRegolamento) toSend.regolamento = this.regolamento;
      else toSend.regolamento = null;

      if (this.mostraConfig) toSend.config = JSON.parse(this.config);
      else toSend.config = null;

      toSend.token = tokenValue;

      this.http.post('/game/crea', toSend).subscribe(
        async (res) => {
          this.data.reset();
          this.alertCreator.createInfoAlert('Gioco creato', 'Il gioco è stato creato con successo.');
          this.loadGames();
          this.segment = "lista";
          await loading.dismiss();
        },
        async (res) => {
          this.data.reset();
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Creazione gioco fallita');
        });
    }
  }

  controllaCampi() {
    if (this.data.value.minGiocatori < 1 || this.data.value.maxGiocatori < 1) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero dei giocatori non può essere negativo!');
      return false;
    }
    if (this.data.value.minGiocatori > this.data.value.maxGiocatori) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero minimo dei giocatori non può essere maggiore del numero massimo!');
      return false;
    }
    if (this.mostraConfig) {
      if (!this.config) {
        this.alertCreator.createInfoAlert('Errore nei dati', 'Scrivi qualcosa nel JSON di configurazione!');
        return false;
      }
      try {
        const tmp = JSON.parse(this.config);
      } catch (error) {
        this.alertCreator.createInfoAlert('Errore nei dati', 'Il JSON di configurazione contiene errori nella sintassi!');
        return false;
      }
    }
    return true;
  }
}
