import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-cerca-pubblica',
  templateUrl: './cerca-pubblica.page.html',
  styleUrls: ['./cerca-pubblica.page.scss'],
})
export class CercaPubblicaPage implements OnInit {
  lobbies = [
    { codice: 1, nome: "Gioco dell'Oca", admin_lobby: "pippo", min_giocatori: 2, max_giocatori: 6 },
    { codice: 2, nome: "Gioco dell'Oca", admin_lobby: "pippo", min_giocatori: 2, max_giocatori: 6 },
    { codice: 3, nome: "Gioco dell'Oca", admin_lobby: "pippo", min_giocatori: 2, max_giocatori: 6 },
    { codice: 4, nome: "Gioco dell'Oca", admin_lobby: "pippo", min_giocatori: 2, max_giocatori: 6 }
  ]


  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  //TODO commentare
  async partecipa(lobby) {
    console.log(lobby);

    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.loginService.getToken()).value;

    const toSend = {
      token: token_value,
      codice_lobby: lobby.codice
    }

    return this.http.post('/lobby/partecipa', toSend).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          this.modalController.dismiss();
          this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
          await loading.dismiss();
        },
        async (res) => {
          await loading.dismiss();
          this.modalController.dismiss();
          //TODO da fare
          // this.errorManager.stampaErrore(res, 'Creazione Lobby fallita');
        });
  }
}
