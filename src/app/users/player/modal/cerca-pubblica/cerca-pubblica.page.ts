import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-cerca-pubblica',
  templateUrl: './cerca-pubblica.page.html',
  styleUrls: ['./cerca-pubblica.page.scss'],
})
export class CercaPubblicaPage implements OnInit {
  lobbies = [];
  lobbiesDaVisualizzare = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private modalController: ModalController,
    private errorManager: ErrorManagerService
  ) {
    this.loadLobby();
  }

  ngOnInit() {
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  async loadLobby() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/lobby/pubbliche', { headers }).subscribe(
      async (res) => {
        this.lobbies = await res['results'];
        await this.getPartecipantiLobby(headers);

        //TODO
        // this.reloadManager.completaReload(event);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile caricare le Lobby!');
        // this.reloadManager.completaReload(event);
      });
  }

  async getPartecipantiLobby(headers) {
    this.lobbies.forEach(lobby => {
      this.http.get('/lobby/giocatori/' + lobby.codice, { headers }).subscribe(
        async (res) => {
          var tmp = await res['results'];
          lobby['partecipanti'] = tmp[0].count;
          if (lobby.partecipanti < lobby.max_giocatori) this.lobbiesDaVisualizzare.push(lobby);
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile reperire i partecipanti della lobby!');
          //TODO:
          // this.reloadManager.completaReload(event);
        });
    })
  }

  //TODO commentare
  async partecipa(lobby) {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.loginService.getToken()).value;
    const toSend = { 'token': tokenValue, 'codice_lobby': lobby.codice }

    return this.http.post('/lobby/partecipa', toSend).subscribe(
      async (res) => {
        this.modalController.dismiss();
        this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.modalController.dismiss();
        this.errorManager.stampaErrore(res, 'Partecipazione a lobby fallita');
      });
  }
}
