import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
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

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private modalController: ModalController
  ) {
    this.loadGames();
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async loadGames(event?) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/games', { headers }).subscribe(
      async (res) => {
        this.games = this.games.concat(res['results']);
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

    // modal.onDidDismiss().then((data) => {
    //   const modUser = data['data'];
    //   console.log('mod_user', modUser);

    //   if (modUser)
    //     this.users[index] = modUser;
    // });

    return await modal.present();
  }
}
